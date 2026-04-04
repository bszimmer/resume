import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const client = DynamoDBDocumentClient.from(new DynamoDBClient())
const ssmClient = new SSMClient()
const TABLE = process.env.TABLE_NAME
const PK = 'LEADERBOARD'

let turnstileSecret
{
  const { Parameter } = await ssmClient.send(
    new GetParameterCommand({ Name: process.env.TURNSTILE_SECRET_PARAM, WithDecryption: true }),
  )
  turnstileSecret = Parameter.Value
}

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
    const { time, name, company, playerId, turnstileToken } = body
    if (!turnstileToken) {
      return { statusCode: 403, headers: HEADERS, body: JSON.stringify({ error: 'Missing verification token' }) }
    }
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: turnstileSecret, response: turnstileToken }),
    })
    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      return { statusCode: 403, headers: HEADERS, body: JSON.stringify({ error: 'Verification failed' }) }
    }
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
