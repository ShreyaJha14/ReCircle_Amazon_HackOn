// scripts/seed-data.js
// Seeds DynamoDB with realistic demo data for the hackathon demo.
// Usage: node scripts/seed-data.js

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const raw = new DynamoDBClient({
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
const dynamo = DynamoDBDocumentClient.from(raw, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLES = {
  ITEMS:          process.env.DYNAMODB_ITEMS_TABLE          || "recircle-items",
  LISTINGS:       process.env.DYNAMODB_LISTINGS_TABLE       || "recircle-listings",
  PASSPORTS:      process.env.DYNAMODB_PASSPORTS_TABLE      || "recircle-passports",
  SUSTAINABILITY: process.env.DYNAMODB_SUSTAINABILITY_TABLE || "recircle-sustainability",
};

// ── Sample graded items (mirrors ReturnedProductsPage todaysReturns) ──────────
const SEED_ITEMS = [
  { productName: "Wireless Noise-Cancelling Headphones", category: "Electronics", grade: "A", trustScore: 96, carbonSavedKg: 12.5, status: "graded", reason: "Changed mind" },
  { productName: "Running Shoes — Size 9", category: "Shoes", grade: "A", trustScore: 93, carbonSavedKg: 6.8, status: "graded", reason: "Wrong size" },
  { productName: "Smart Home Hub", category: "Electronics", grade: "B", trustScore: 88, carbonSavedKg: 8.1, status: "routed", reason: "Found a better deal" },
  { productName: "Stainless Steel Cookware Set", category: "Home & Kitchen", grade: "A", trustScore: 97, carbonSavedKg: 9.3, status: "graded", reason: "Unwanted gift" },
  { productName: "Baby Monitor with Night Vision", category: "Baby Products", grade: "B", trustScore: 90, carbonSavedKg: 3.9, status: "graded", reason: "Item defective" },
  { productName: "Men's Bomber Jacket", category: "Clothing", grade: "C", trustScore: 78, carbonSavedKg: 4.2, status: "graded", reason: "Didn't match description" },
  { productName: "Bluetooth Portable Speaker", category: "Electronics", grade: "A", trustScore: 95, carbonSavedKg: 7.2, status: "graded", reason: "Bought as gift — kept" },
  { productName: "Induction Cooktop", category: "Home & Kitchen", grade: "B", trustScore: 85, carbonSavedKg: 11.0, status: "graded", reason: "Upgraded" },
];

// ── Sample listings ────────────────────────────────────────────────────────────
const SEED_LISTINGS = [
  { productName: "Nike Air Max 270", category: "Shoes", grade: "A", price: 12.99, originalPrice: 59.99, trustScore: 95, location: { city: "London", postcode: "E1" } },
  { productName: "Philips Baby Monitor", category: "Baby Products", grade: "B", price: 8.99, originalPrice: 34.99, trustScore: 90, location: { city: "Manchester", postcode: "M1" } },
  { productName: "Prestige Induction Cooktop", category: "Home & Kitchen", grade: "A", price: 15.99, originalPrice: 42.00, trustScore: 92, location: { city: "Birmingham", postcode: "B1" } },
];

// ── Sustainability aggregate ───────────────────────────────────────────────────
const SUSTAINABILITY_SEED = {
  aggregateId: "global",
  totalItemsGraded: 0,  // real grading events will increment this
  totalCarbonSavedKg: 0,
  updatedAt: new Date().toISOString(),
  seeded: true,
};

async function seed() {
  console.log("♻️  ReCircle — Seeding demo data\n");

  // Seed items
  for (const item of SEED_ITEMS) {
    const now = new Date().toISOString();
    const id = `demo-${uuidv4()}`;
    await dynamo.send(new PutCommand({
      TableName: TABLES.ITEMS,
      Item: {
        itemId: id,
        ...item,
        photoUrl: null,
        defects: item.grade === "C" ? ["Visible wear at collar"] : [],
        summary: `${item.productName} is in ${item.grade === "A" ? "like-new" : item.grade === "B" ? "good" : "fair"} condition. AI verified by ReCircle.`,
        recommendedAction: item.grade === "A" ? "resell" : item.grade === "B" ? "resell" : "refurbish",
        estimatedResaleDiscountPct: item.grade === "A" ? 30 : item.grade === "B" ? 45 : 60,
        createdAt: now,
        updatedAt: now,
      }
    }));
    console.log(`  ✅ Item: ${item.productName}`);
  }

  // Seed listings
  for (const listing of SEED_LISTINGS) {
    const now = new Date().toISOString();
    await dynamo.send(new PutCommand({
      TableName: TABLES.LISTINGS,
      Item: {
        listingId: `demo-listing-${uuidv4()}`,
        sellerId: "seed-seller",
        ...listing,
        description: `AI-verified ${listing.grade === "A" ? "like-new" : "good"} condition ${listing.productName}. Ready for its next owner.`,
        status: "active",
        views: Math.floor(Math.random() * 50),
        createdAt: now,
        updatedAt: now,
      }
    }));
    console.log(`  ✅ Listing: ${listing.productName}`);
  }

  // Seed sustainability aggregate
  await dynamo.send(new PutCommand({
    TableName: TABLES.SUSTAINABILITY,
    Item: SUSTAINABILITY_SEED,
  }));
  console.log("  ✅ Sustainability aggregate initialised");

  console.log("\n✅ Seed complete. Your demo data is ready.\n");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
