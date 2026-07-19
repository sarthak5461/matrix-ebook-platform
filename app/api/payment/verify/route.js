import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth";
import crypto from "crypto";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const db = await getDb();
    const auth = await requireUser();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    const user = auth.user;
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      body || {};
    if (!razorpay_order_id)
      return NextResponse.json({ error: "Missing order id" }, 400);

    const purchase = await db
      .collection("purchases")
      .findOne({ razorpayOrderId: razorpay_order_id, userId: user.id });
    if (!purchase)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const mock = purchase.mock === true;
    let valid = false;
    if (mock) {
      valid = true;
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const expected = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      valid = expected === razorpay_signature;
    }
    if (!valid)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    await db.collection("purchases").updateOne(
      { id: purchase.id },
      {
        $set: {
          razorpayPaymentId:
            razorpay_payment_id || "pay_mock_" + uuidv4().slice(0, 8),
          status: "paid",
          purchasedAt: new Date(),
        },
      },
    );
    await db
      .collection("users")
      .updateOne({ id: user.id }, { $set: { purchasedBook: true } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Payment verification failed:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
