import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const auth = await requireAdmin();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    const purchases = await db
      .collection("purchases")
      .find({})
      .sort({ createdAt: -1 })
      .limit(2000)
      .toArray();
    const userIds = [...new Set(purchases.map((p) => p.userId))];
    const users = await db
      .collection("users")
      .find({ id: { $in: userIds } })
      .toArray();
    const byId = Object.fromEntries(users.map((u) => [u.id, u]));
    const enriched = purchases.map(({ _id, ...p }) => ({
      ...p,
      userName: byId[p.userId]?.name || "—",
      userEmail: byId[p.userId]?.email || "—",
    }));
    return NextResponse.json({ purchases: enriched });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
