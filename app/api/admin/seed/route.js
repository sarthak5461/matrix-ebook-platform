import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/mongodb";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const auth = await requireAdmin();

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = await getDb();

    const email = (process.env.ADMIN_EMAIL || "admin@matrix.com")
      .trim()
      .toLowerCase();

    const existing = await db.collection("users").findOne({ email });

    if (!existing) {
      const passwordHash = await hashPassword(
        process.env.ADMIN_PASSWORD || "Admin@123",
      );

      const result = await db.collection("users").insertOne({
        id: uuidv4(),
        name: process.env.ADMIN_NAME || "Site Admin",
        email,
        passwordHash,
        role: "admin",
        purchasedBook: true,
        createdAt: new Date(),
      });

      if (!result.acknowledged) {
        throw new Error("Failed to create admin.");
      }

      console.log("Admin created:", email);
    } else if (existing.role !== "admin") {
      const result = await db.collection("users").updateOne(
        { id: existing.id },
        {
          $set: {
            role: "admin",
            purchasedBook: true,
          },
        },
      );

      if (result.modifiedCount !== 1) {
        throw new Error("Failed to promote admin.");
      }

      console.log("Existing user promoted to admin.");
    } else {
      console.log("Admin already exists.");
    }
    return NextResponse.json({
      ok: true,
      message: "Admin seeded successfully.",
    });
  } catch (error) {
    console.error("Admin seed failed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
