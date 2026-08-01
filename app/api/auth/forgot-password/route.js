import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendResetPasswordEmail } from "@/lib/email/resetPassword";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { forgotSchema } from "@/lib/validators";
import { applyRateLimit, limiters } from "@/lib/rateLimiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const limited = await applyRateLimit(request, limiters.forgotPassword);

    if (limited) {
      return limited;
    }

    const body = await request.json();
    const parse = forgotSchema.safeParse(body);
    if (!parse.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const db = await getDb();
    const email = parse.data.email.trim().toLowerCase();
    const user = await db.collection("users").findOne({ email });
    // Always respond ok to avoid user-enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

      await db.collection("password_resets").deleteMany({
        userId: user.id,
        used: false,
      });

      await db.collection("password_resets").insertOne({
        id: uuidv4(),
        userId: user.id,
        token: tokenHash,
        expiresAt,
        used: false,
        createdAt: new Date(),
      });

      const base =
        process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

      if (!base) {
        throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
      }

      const resetLink = `${base}/reset-password?token=${token}`;
      try {
        await sendResetPasswordEmail({
          email: user.email,
          name: user.name,
          resetLink,
        });
      } catch (error) {
        console.error("Failed to send reset password email:", error);
      }
    }
    return NextResponse.json({
      ok: true,
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password failed:", error);
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 },
    );
  }
}
