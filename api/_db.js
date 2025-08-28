const { MongoClient } = require("mongodb");

let client;
let db;

async function connectToDB() {
  if (db) return db; // Reuse if already connected

  if (!process.env.MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not set in .env");
  }

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  db = client.db("fare-check"); // database name
  console.log("✅ Connected to MongoDB");

  return db;
}

module.exports = { connectToDB };
