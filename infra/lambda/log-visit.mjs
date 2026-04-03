import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { randomUUID } from 'crypto'

const dynamo = new DynamoDBClient({})
const TABLE_NAME = process.env.TABLE_NAME

export async function handler(lambdaEvent) {
  // Preflight is handled automatically by the Function URL CORS config
  if (lambdaEvent.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 204, body: '' }
  }

  let body = {}
  try {
    body = JSON.parse(lambdaEvent.body ?? '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid json' }) }
  }

  const { event = 'unknown', ref, company, section } = body

  const item = {
    id: { S: randomUUID() },
    timestamp: { S: new Date().toISOString() },
    event: { S: String(event) },
    ...(ref && { ref: { S: String(ref) } }),
    ...(company && { company: { S: String(company) } }),
    ...(section && { section: { S: String(section) } }),
  }

  await dynamo.send(new PutItemCommand({ TableName: TABLE_NAME, Item: item }))

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logged: true }),
  }
}
