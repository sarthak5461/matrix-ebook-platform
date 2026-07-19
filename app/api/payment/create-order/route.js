import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const db = await getDb();
    const auth = await requireUser();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    const user = auth.user;
    if (user.purchasedBook)
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });

    const price = Number(process.env.EBOOK_PRICE_INR || 149);
    const amount = price * 100; // paise
    const mock =
      process.env.MOCK_RAZORPAY === "true" ||
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET;

    let order;
    if (mock) {
      order = {
        id: "order_mock_" + uuidv4().replace(/-/g, "").slice(0, 14),
        amount,
        currency: "INR",
        status: "created",
        mock: true,
      };
    } else {
      // Real Razorpay
      const authStr = Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
      ).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authStr}`,
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: "rcpt_" + user.id.slice(0, 10),
        }),
      });
      if (!rzpRes.ok) {
        const err = await rzpRes.text();
        return NextResponse.json(
          { error: "Razorpay order failed", details: err },
          { status: 500 },
        );
      }
      order = await rzpRes.json();
    }

    await db.collection("purchases").insertOne({
      id: uuidv4(),
      userId: user.id,
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      amount,
      status: "created",
      purchasedAt: null,
      createdAt: new Date(),
      mock,
    });

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency: "INR",
      keyId:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID ||
        "rzp_test_MOCK",
      mock,
      user: { name: user.name, email: user.email },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
