import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth";
import crypto from "crypto";
import { APP } from "@/lib/config/app";
import { sendPurchaseConfirmationEmail } from "@/lib/email/purchaseConfirmation";

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

    const parse = verifyPaymentSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      parse.data;

    if (!razorpay_order_id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const purchase = await db.collection("purchases").findOne({
      razorpayOrderId: razorpay_order_id,
      userId: user.id,
    });

    if (!purchase) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prevent replay / duplicate verification
    if (purchase.status === "paid") {
      return NextResponse.json({
        ok: true,
        message: "Payment already verified.",
      });
    }

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
      valid = crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(razorpay_signature),
      );
    }
    if (!valid)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    const purchasedAt = new Date();
    const purchaseResult = await db.collection("purchases").updateOne(
      { id: purchase.id },
      {
        $set: {
          razorpayPaymentId:
            razorpay_payment_id || "pay_mock_" + uuidv4().slice(0, 8),
          status: "paid",
          purchasedAt,
        },
      },
    );
    if (purchaseResult.modifiedCount !== 1) {
      throw new Error("Failed to update purchase.");
    }
    await db
      .collection("users")
      .updateOne({ id: user.id }, { $set: { purchasedBook: true } });

    const base =
      process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    try {
      await sendPurchaseConfirmationEmail({
        email: user.email,
        name: user.name,
        bookTitle: APP.book.title,
        amount: purchase.amount / 100,
        orderId: purchase.razorpayOrderId,
        purchaseDate: new Date(),
        readerUrl: `${base}/reader`,
      });
    } catch (error) {
      console.error("Purchase email failed:", error);
    }

    return NextResponse.json({
      ok: true,
      purchased: true,
    });
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
