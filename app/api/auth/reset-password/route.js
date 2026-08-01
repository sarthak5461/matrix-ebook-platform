import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";
import { resetSchema } from "@/lib/validators";
import { applyRateLimit, limiters } from "@/lib/rateLimiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const parse = resetSchema.safeParse(body);
    if (!parse.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { token, password } = parse.data;
    const db = await getDb();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const rec = await db.collection("password_resets").findOne({
      token: tokenHash,
      used: false,
    });
    if (!rec)
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    if (new Date(rec.expiresAt) < new Date()) {
      await db.collection("password_resets").deleteOne({
        id: rec.id,
      });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }
    const user = await db.collection("users").findOne({
      id: rec.userId,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const hashed = await hashPassword(password);
    const result = await db.collection("users").updateOne(
      { id: rec.userId },
      {
        $set: {
          passwordHash: hashed,
          updatedAt: new Date(),
        },
      },
    );
    if (result.modifiedCount !== 1) {
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 500 },
      );
    }
    await db
      .collection("password_resets")
      .updateOne({ id: rec.id }, { $set: { used: true } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset password failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
