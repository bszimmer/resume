/**
 * One-time script: deletes all items from the resume-leaderboard DynamoDB table.
 * Run from the infra/ directory:
 *   node scripts/clear-leaderboard.mjs
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'

const TABLE = 'resume-leaderboard'
const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }))

async function clearTable() {
  let totalDeleted = 0
  let lastKey = undefined

  do {
    // Scan for keys only (no need to fetch full items)
    const scan = await client.send(new ScanCommand({
      TableName: TABLE,
      ProjectionExpression: 'pk, sk',
      ExclusiveStartKey: lastKey,
    }))

    const items = scan.Items ?? []
    lastKey = scan.LastEvaluatedKey

    if (items.length === 0) continue

    // BatchWrite accepts max 25 deletes at a time
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25).map(({ pk, sk }) => ({
        DeleteRequest: { Key: { pk, sk } },
      }))
      await client.send(new BatchWriteCommand({
        RequestItems: { [TABLE]: batch },
      }))
      totalDeleted += batch.length
    }

    console.log(`Deleted ${totalDeleted} items so far...`)
  } while (lastKey)

  console.log(`Done. Deleted ${totalDeleted} items from ${TABLE}.`)
}

clearTable().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
