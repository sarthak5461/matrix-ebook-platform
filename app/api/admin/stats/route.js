import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    const db = await getDb();

    const [totalUsers, totalPurchases, revenue] = await Promise.all([
      db.collection("users").countDocuments({
        role: { $ne: "admin" },
      }),

      db.collection("purchases").countDocuments({
        status: "paid",
      }),

      db
        .collection("purchases")
        .aggregate([
          {
            $match: {
              status: "paid",
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$amount",
              },
            },
          },
        ])
        .toArray(),
    ]);

    const totalRevenuePaise = revenue[0]?.total || 0;
    return NextResponse.json(
      {
        totalUsers,
        totalPurchases,
        totalRevenue: totalRevenuePaise / 100,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30",
        },
      },
    );
  } catch (error) {
    console.error("Admin stats failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
