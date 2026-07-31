import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    const db = await getDb();
    const users = await db
      .collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();
    return NextResponse.json({
      users: users.map(({ _id, passwordHash, ...u }) => u),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
