import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { setAuthCookie, signToken, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { v4 as uuidv4 } from "uuid";
import { sendWelcomeEmail } from "@/lib/email/welcome";
import { applyRateLimit, limiters } from "@/lib/rateLimiter";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const limited = await applyRateLimit(request, limiters.register);

    if (limited) {
      return limited;
    }

    const body = await request.json();
    const parse = registerSchema.safeParse(body);
    if (!parse.success)
      return NextResponse.json(
        { error: "Invalid input", details: parse.error.flatten() },
        { status: 400 },
      );

    const db = await getDb();
    const { name, password } = parse.data;
    const email = parse.data.email.trim().toLowerCase();
    const existing = await db.collection("users").findOne({ email });
    if (existing)
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );

    const hashedPassword = await hashPassword(password);
    const user = {
      id: uuidv4(),
      name,
      email,
      passwordHash: hashedPassword,
      role: "user",
      purchasedBook: false,
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(user);

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    await setAuthCookie(token);

    // Build the dashboard URL
    const base =
      process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    // Send welcome email (don't fail registration if email fails)
    try {
      await sendWelcomeEmail({
        email: user.email,
        name: user.name,
        dashboardUrl: `${base}/dashboard`,
      });
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    const { passwordHash, _id, ...safe } = user;

    return NextResponse.json({ user: safe }, { status: 201 });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
