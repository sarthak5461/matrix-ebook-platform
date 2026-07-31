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
    const purchases = await db
      .collection("purchases")
      .find({ status: "paid" })
      .sort({ purchasedAt: -1 })
      .toArray();
    const userIds = [...new Set(purchases.map((p) => p.userId))];
    const users = await db
      .collection("users")
      .find({ id: { $in: userIds } })
      .toArray();
    const byId = Object.fromEntries(users.map((u) => [u.id, u]));
    const rows = [
      [
        "PurchaseID",
        "UserName",
        "UserEmail",
        "RazorpayOrderId",
        "RazorpayPaymentId",
        "AmountINR",
        "Status",
        "PurchasedAt",
      ],
    ];
    for (const p of purchases) {
      rows.push([
        p.id,
        byId[p.userId]?.name || "",
        byId[p.userId]?.email || "",
        p.razorpayOrderId,
        p.razorpayPaymentId || "",
        (p.amount / 100).toFixed(2),
        p.status,
        p.purchasedAt ? new Date(p.purchasedAt).toISOString() : "",
      ]);
    }
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const res = new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sales_report_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
    return res;
  } catch (error) {
    console.error("Export Failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
