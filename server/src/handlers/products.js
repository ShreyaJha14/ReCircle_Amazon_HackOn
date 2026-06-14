// src/handlers/products.js
// Core Amazon-like product catalogue — serves the HomePage, ProductPage, Search.
// Provides real product data plus ReCircle-specific fields (passport, grade, etc.)

import { v4 as uuidv4 } from "uuid";

// ── Static product catalogue (mirrors the frontend dummy data) ────────────────
// In production these come from a DynamoDB catalogue table or Elasticsearch.
const PRODUCTS = [
  {
    id: "0",
    title: "Wireless Noise-Cancelling Headphones",
    image: "/images/product_0.jpg",
    smallImage: "/images/product_0_small.jpg",
    category: "Electronics",
    price: 79.99,
    oldPrice: 129.99,
    rating: 4.5,
    reviews: 2847,
    prime: true,
    badge: "Best Seller",
    description: "Premium wireless headphones with active noise cancellation, 30h battery and multipoint Bluetooth.",
    recircle: {
      available: true,
      grade: "A",
      trustScore: 96,
      price: 39.99,
      carbonSavedKg: 12.5,
      passportId: "passport-demo-001",
    },
    passport: {
      origin: "Vietnam",
      materials: "Recycled ABS plastic, aluminium, memory foam",
      repairHistory: "None — first resale",
      recyclability: "ABS plastic body recyclable at e-waste centre",
    },
  },
  {
    id: "1",
    title: "Running Shoes — Size 9",
    image: "/images/product_5.jpg",
    smallImage: "/images/product_1_small.jpg",
    category: "Shoes",
    price: 64.99,
    oldPrice: 89.99,
    rating: 4.3,
    reviews: 1203,
    prime: true,
    badge: "New",
    description: "Lightweight running shoes with responsive foam midsole. Ideal for road and track.",
    recircle: {
      available: true,
      grade: "A",
      trustScore: 93,
      price: 24.99,
      carbonSavedKg: 6.8,
      passportId: "passport-demo-002",
    },
    passport: {
      origin: "Indonesia",
      materials: "Mesh upper, recycled EVA foam sole",
      repairHistory: "None — first resale",
      recyclability: "Sole recyclable via Nike Grind / equivalent scheme",
    },
  },
  {
    id: "2",
    title: "Smart Home Hub",
    image: "/images/product_7.jpg",
    smallImage: "/images/product_2_small.jpg",
    category: "Electronics",
    price: 59.99,
    oldPrice: 89.99,
    rating: 4.1,
    reviews: 987,
    prime: true,
    badge: null,
    description: "Control your smart home from one device. Works with Alexa, Google, and HomeKit.",
    recircle: {
      available: true,
      grade: "B",
      trustScore: 88,
      price: 29.99,
      carbonSavedKg: 8.1,
      passportId: "passport-demo-003",
    },
    passport: {
      origin: "China",
      materials: "Recycled polycarbonate, silicon",
      repairHistory: "Factory reset completed",
      recyclability: "Return to any Amazon Locker for e-waste recycling",
    },
  },
  {
    id: "3",
    title: "Stainless Steel Cookware Set",
    image: "/images/product_10.jpg",
    smallImage: "/images/product_3_small.jpg",
    category: "Home & Kitchen",
    price: 109.99,
    oldPrice: 159.99,
    rating: 4.7,
    reviews: 3421,
    prime: true,
    badge: "Amazon's Choice",
    description: "5-piece stainless steel cookware set. Dishwasher safe, induction compatible.",
    recircle: {
      available: true,
      grade: "A",
      trustScore: 97,
      price: 49.99,
      carbonSavedKg: 9.3,
      passportId: "passport-demo-004",
    },
    passport: {
      origin: "Germany",
      materials: "18/10 stainless steel, aluminium core",
      repairHistory: "None — first resale",
      recyclability: "100% metal — fully recyclable at scrap metal facility",
    },
  },
  {
    id: "4",
    title: "Baby Monitor with Night Vision",
    image: "/images/product_12.jpg",
    smallImage: "/images/product_4_small.jpg",
    category: "Baby Products",
    price: 44.99,
    oldPrice: 64.99,
    rating: 4.4,
    reviews: 876,
    prime: true,
    badge: null,
    description: "HD baby monitor with night vision, two-way audio, temperature sensor and lullabies.",
    recircle: {
      available: true,
      grade: "B",
      trustScore: 90,
      price: 19.99,
      carbonSavedKg: 3.9,
      passportId: "passport-demo-005",
    },
    passport: {
      origin: "Netherlands",
      materials: "ABS plastic, glass lens",
      repairHistory: "Battery replaced — fully functional",
      recyclability: "e-Waste collection point (WEEE directive)",
    },
  },
  {
    id: "5",
    title: "Men's Bomber Jacket",
    image: "/images/product_13.jpg",
    smallImage: "/images/product_5_small.jpg",
    category: "Clothing",
    price: 39.99,
    oldPrice: 69.99,
    rating: 4.0,
    reviews: 543,
    prime: false,
    badge: null,
    description: "Classic bomber jacket. 100% nylon shell, polyester lining. Machine washable.",
    recircle: {
      available: true,
      grade: "C",
      trustScore: 78,
      price: 12.99,
      carbonSavedKg: 4.2,
      passportId: "passport-demo-006",
    },
    passport: {
      origin: "Bangladesh",
      materials: "100% nylon, polyester lining",
      repairHistory: "Small seam repair at collar",
      recyclability: "Textile bank or clothes swap — nylon recyclable",
    },
  },
  {
    id: "7",
    title: "Bluetooth Portable Speaker",
    image: "/images/product_7.jpg",
    smallImage: "/images/product_7_small.jpg",
    category: "Electronics",
    price: 34.99,
    oldPrice: 54.99,
    rating: 4.6,
    reviews: 1567,
    prime: true,
    badge: "Best Seller",
    description: "360° sound, IPX7 waterproof, 24h battery life. USB-C charging.",
    recircle: {
      available: true,
      grade: "A",
      trustScore: 95,
      price: 17.99,
      carbonSavedKg: 7.2,
      passportId: "passport-demo-007",
    },
    passport: {
      origin: "China",
      materials: "Recycled fabric, ABS housing",
      repairHistory: "None — first resale",
      recyclability: "Battery must be removed before recycling at WEEE point",
    },
  },
];

// ── GET /api/products ─────────────────────────────────────────────────────────
export async function getProducts(req, res) {
  const { category, search, limit } = req.query;
  let products = [...PRODUCTS];

  if (category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (limit) products = products.slice(0, parseInt(limit));

  return res.json({ success: true, products, count: products.length });
}

// ── GET /api/products/:id ─────────────────────────────────────────────────────
export async function getProduct(req, res) {
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  return res.json({ success: true, product });
}

// ── GET /api/products/search?q= ───────────────────────────────────────────────
export async function searchProducts(req, res) {
  const q = (req.query.q || "").toLowerCase().trim();
  if (!q) return res.json({ success: true, products: [], count: 0 });

  const results = PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );

  return res.json({ success: true, products: results, count: results.length });
}

// ── GET /api/products/categories ──────────────────────────────────────────────
export async function getCategories(req, res) {
  const categories = [...new Set(PRODUCTS.map((p) => p.category))];
  return res.json({ success: true, categories });
}
