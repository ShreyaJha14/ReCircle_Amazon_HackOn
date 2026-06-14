// src/utils/awsClients.js
// Centralised AWS SDK v3 client instances — imported by every handler
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { SNSClient } from "@aws-sdk/client-sns";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";

const credentials =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined; // falls back to IAM role / AWS_PROFILE when deployed on Lambda / EC2

// ── DynamoDB ──────────────────────────────────────────────────────────────────
const dynamoRaw = new DynamoDBClient({ region, credentials });
export const dynamo = DynamoDBDocumentClient.from(dynamoRaw, {
  marshallOptions: { removeUndefinedValues: true },
});

// ── S3 ────────────────────────────────────────────────────────────────────────
export const s3 = new S3Client({ region, credentials });

// ── Bedrock (same region — verify your account has Bedrock access) ────────────
export const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || region,
  credentials,
});

// ── Rekognition ───────────────────────────────────────────────────────────────
export const rekognition = new RekognitionClient({ region, credentials });

// ── SNS ───────────────────────────────────────────────────────────────────────
export const sns = new SNSClient({ region, credentials });

// ── Table names (single source of truth) ─────────────────────────────────────
export const TABLES = {
  ITEMS: process.env.DYNAMODB_ITEMS_TABLE || "recircle-items",
  LISTINGS: process.env.DYNAMODB_LISTINGS_TABLE || "recircle-listings",
  PASSPORTS: process.env.DYNAMODB_PASSPORTS_TABLE || "recircle-passports",
  SUSTAINABILITY:
    process.env.DYNAMODB_SUSTAINABILITY_TABLE || "recircle-sustainability",
  USERS: process.env.DYNAMODB_USERS_TABLE || "recircle-users",
  ROUTING: process.env.DYNAMODB_ROUTING_TABLE || "recircle-routing-decisions",
};

export const S3_BUCKET = process.env.S3_BUCKET_NAME || "recircle-item-photos";

export const BEDROCK_MODELS = {
  CLAUDE_SONNET: process.env.BEDROCK_CLAUDE_MODEL_ID || "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
  CLAUDE_HAIKU:  process.env.BEDROCK_CLAUDE_HAIKU_MODEL_ID || "us.anthropic.claude-3-haiku-20240307-v1:0",
};
