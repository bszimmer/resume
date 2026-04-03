/**
 * One-time migration: re-keys the resume-leaderboard table so each player
 * has a single row (sk = playerName) containing their best time.
 *
 * Run from the infra/ directory:
 *   node scripts/migrate-leaderboard.mjs
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'

const TABLE = 'resume-leaderboard'
const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }))

async function scanAll() {
  const items = []
  let lastKey = undefined
  do {
    const result = await client.send(new ScanCommand({
      TableName: TABLE,
      ExclusiveStartKey: lastKey,
    }))
    items.push(...(result.Items ?? []))
    lastKey = result.LastEvaluatedKey
  } while (lastKey)
  return items
}

async function batchDelete(keys) {
  for (let i = 0; i < keys.length; i += 25) {
    const batch = keys.slice(i, i + 25).map(({ pk, sk }) => ({
      DeleteRequest: { Key: { pk, sk } },
    }))
    await client.send(new BatchWriteCommand({ RequestItems: { [TABLE]: batch } }))
  }
}

async function batchWrite(items) {
  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25).map((item) => ({
      PutRequest: { Item: item },
    }))
    await client.send(new BatchWriteCommand({ RequestItems: { [TABLE]: batch } }))
  }
}

async function migrate() {
  // 1. Read all existing items
  console.log('Reading existing items...')
  const all = await scanAll()
  console.log(`Found ${all.length} items.`)

  if (all.length === 0) {
    console.log('Nothing to migrate.')
    return
  }

  // 2. Deduplicate — keep each player's best time
  const bestByPlayer = new Map()
  for (const item of all) {
    const key = item.name?.toLowerCase().trim()
    if (!key) continue
    const existing = bestByPlayer.get(key)
    if (!existing || item.time < existing.time) {
      bestByPlayer.set(key, item)
    }
  }
  console.log(`${bestByPlayer.size} unique players found.`)

  // 3. Build new items with sk = playerName
  const newItems = [...bestByPlayer.values()].map((item) => ({
    pk: 'LEADERBOARD',
    sk: randomUUID(),
    time: item.time,
    name: item.name,
    company: item.company ?? '',
    timestamp: item.timestamp,
  }))

  // Preview what will be written
  console.log('\nMigrating the following records:')
  newItems
    .sort((a, b) => a.time - b.time)
    .forEach((item, i) => {
      const mins = Math.floor(item.time / 60)
      const secs = (item.time % 60).toFixed(2).padStart(5, '0')
      console.log(`  ${i + 1}. ${item.name} (${item.company || 'no company'}) — ${mins}:${secs}`)
    })

  // 4. Delete all old items
  console.log('\nDeleting old items...')
  await batchDelete(all.map(({ pk, sk }) => ({ pk, sk })))
  console.log(`Deleted ${all.length} old items.`)

  // 5. Write new items
  console.log('Writing new items...')
  await batchWrite(newItems)
  console.log(`Written ${newItems.length} new items.`)

  console.log('\nMigration complete.')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
