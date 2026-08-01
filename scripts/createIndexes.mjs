import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

const client = new MongoClient(process.env.MONGODB_URI);

async function createIndexes() {
  try {
    await client.connect();

    const db = client.db(process.env.DB_NAME);

    // ==========================
    // USERS
    // ==========================

    await db.collection("users").createIndex({ email: 1 }, { unique: true });

    await db.collection("users").createIndex({
      role: 1,
    });

    await db.collection("users").createIndex({
      createdAt: -1,
    });

    // ==========================
    // PASSWORD RESETS
    // ==========================

    await db
      .collection("password_resets")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    await db.collection("password_resets").createIndex({
      token: 1,
    });

    await db.collection("password_resets").createIndex({
      userId: 1,
    });

    // ==========================
    // PURCHASES
    // ==========================

    await db.collection("purchases").createIndex({
      status: 1,
    });

    await db.collection("purchases").createIndex({
      createdAt: -1,
    });

    await db.collection("purchases").createIndex({
      purchasedAt: -1,
    });

    await db.collection("purchases").createIndex({
      userId: 1,
    });

    await db.collection("purchases").createIndex(
      {
        userId: 1,
        status: 1,
      },
      {
        unique: true,
        partialFilterExpression: {
          status: "created",
        },
      },
    );
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

createIndexes();
