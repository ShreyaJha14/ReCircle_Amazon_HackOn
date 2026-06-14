// scripts/setup-dynamodb.js
// Run once to create all required DynamoDB tables.
// Usage: node scripts/setup-dynamodb.js

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, waitUntilTableExists } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const TABLES = [
  {
    TableName: process.env.DYNAMODB_ITEMS_TABLE || "recircle-items",
    KeySchema: [{ AttributeName: "itemId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "itemId", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "status-createdAt-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
        BillingMode: "PAY_PER_REQUEST",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: process.env.DYNAMODB_LISTINGS_TABLE || "recircle-listings",
    KeySchema: [{ AttributeName: "listingId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "listingId", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: process.env.DYNAMODB_PASSPORTS_TABLE || "recircle-passports",
    KeySchema: [{ AttributeName: "passportId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "passportId", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: process.env.DYNAMODB_SUSTAINABILITY_TABLE || "recircle-sustainability",
    KeySchema: [{ AttributeName: "aggregateId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "aggregateId", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: process.env.DYNAMODB_USERS_TABLE || "recircle-users",
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: process.env.DYNAMODB_ROUTING_TABLE || "recircle-routing-decisions",
    KeySchema: [{ AttributeName: "decisionId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "decisionId", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
];

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (e) {
    if (e.name === "ResourceNotFoundException") return false;
    throw e;
  }
}

async function main() {
  console.log("♻️  ReCircle — DynamoDB Table Setup\n");

  for (const tableConfig of TABLES) {
    const exists = await tableExists(tableConfig.TableName);
    if (exists) {
      console.log(`✅ ${tableConfig.TableName} — already exists`);
      continue;
    }

    try {
      await client.send(new CreateTableCommand(tableConfig));
      console.log(`⏳ ${tableConfig.TableName} — creating...`);
      await waitUntilTableExists(
        { client, maxWaitTime: 60 },
        { TableName: tableConfig.TableName }
      );
      console.log(`✅ ${tableConfig.TableName} — created`);
    } catch (e) {
      console.error(`❌ ${tableConfig.TableName} — failed:`, e.message);
    }
  }

  console.log("\n✅ Setup complete. Run `npm run seed` to add sample data.\n");
}

main().catch((e) => {
  console.error("Setup failed:", e);
  process.exit(1);
});
