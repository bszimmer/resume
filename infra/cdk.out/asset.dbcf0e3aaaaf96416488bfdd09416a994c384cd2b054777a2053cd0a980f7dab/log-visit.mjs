import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { randomUUID } from 'crypto'

const dynamo = new DynamoDBClient({})
const TABLE_NAME = process.env.TABLE_NAME

const ALLOWED_ORIGIN = 'https://brennanzimmer.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function handler(event) {
  // Preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  const params = event.queryStringParameters ?? {}
  const ref = params.ref ?? null
  const company = params.company ?? null

  const item = {
    id: { S: randomUUID() },
    timestamp: { S: new Date().toISOString() },
    ...(ref && { ref: { S: ref } }),
    ...(company && { company: { S: company } }),
  }

  await dynamo.send(new PutItemCommand({ TableName: TABLE_NAME, Item: item }))

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ logged: true }),
  }
}
