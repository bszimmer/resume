import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'

const client = DynamoDBDocumentClient.from(new DynamoDBClient())
const TABLE = process.env.TABLE_NAME
const PK = 'LEADERBOARD'

const HEADERS = { 'Content-Type': 'application/json' }

export const handler = async (event) => {
  const method = event.requestContext?.http?.method ?? 'GET'

  if (method === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' }

  if (method === 'GET') {
    const result = await client.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: { ':pk': PK },
      }),
    )
    const entries = (result.Items ?? [])
      .sort((a, b) => a.time - b.time)
      .slice(0, 10)
      .map(({ time, name, company, timestamp, sk }) => ({ time, name, company, timestamp, playerId: sk }))
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify(entries) }
  }

  if (method === 'POST') {
    let body
    try {
      body = JSON.parse(event.body ?? '{}')
    } catch {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
    }
    const { time, name, company, playerId } = body
    if (typeof time !== 'number' || !name?.trim() || !playerId?.trim()) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'time (number), name (string), and playerId (string) are required' }),
      }
    }
    try {
      await client.send(
        new UpdateCommand({
          TableName: TABLE,
          Key: { pk: PK, sk: playerId.trim() },
          UpdateExpression: 'SET #time = :time, #name = :name, company = :company, #ts = :ts',
          ConditionExpression: 'attribute_not_exists(#time) OR #time > :time',
          ExpressionAttributeNames: { '#time': 'time', '#name': 'name', '#ts': 'timestamp' },
          ExpressionAttributeValues: {
            ':time': time,
            ':name': name.trim(),
            ':company': (company ?? '').trim(),
            ':ts': new Date().toISOString(),
          },
        }),
      )
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        // Existing time is better — not an error
        return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, updated: false }) }
      }
      throw err
    }
    return { statusCode: 201, headers: HEADERS, body: JSON.stringify({ ok: true, updated: true }) }
  }

  return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) }
}
