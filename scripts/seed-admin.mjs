import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { MONGODB_URI, DB_NAME, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
  process.env;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI");
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD");
}

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  await client.connect();

  const db = client.db(DB_NAME);

  const users = db.collection("users");

  const existing = await users.findOne({
    email: ADMIN_EMAIL,
  });

  if (existing) {
    console.log("✅ Admin already exists.");
    await client.close();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await users.insertOne({
    id: crypto.randomUUID(),
    name: ADMIN_NAME || "Administrator",
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    purchasedBook: false,
    createdAt: new Date(),
  });

  console.log("🎉 Admin created successfully.");

  await client.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
