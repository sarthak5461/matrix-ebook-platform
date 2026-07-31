import { getDb } from "@/lib/mongodb";

export async function rateLimit({ key, limit, windowMs }) {
  const db = await getDb();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  const existing = await db.collection("rate_limits").findOne({ key });

  if (!existing) {
    await db.collection("rate_limits").insertOne({
      key,
      count: 1,
      expiresAt,
    });

    return {
      success: true,
      remaining: limit - 1,
    };
  }

  // Window expired
  if (existing.expiresAt < now) {
    await db.collection("rate_limits").updateOne(
      { key },
      {
        $set: {
          count: 1,
          expiresAt,
        },
      },
    );

    return {
      success: true,
      remaining: limit - 1,
    };
  }

  // Too many requests
  if (existing.count >= limit) {
    return {
      success: false,
      retryAfter: Math.ceil((existing.expiresAt - now) / 1000),
    };
  }

  await db.collection("rate_limits").updateOne(
    { key },
    {
      $inc: {
        count: 1,
      },
    },
  );

  return {
    success: true,
    remaining: limit - existing.count - 1,
  };
}
