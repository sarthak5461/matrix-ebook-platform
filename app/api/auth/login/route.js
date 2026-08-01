import { getDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { setAuthCookie, signToken, comparePassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { applyRateLimit, limiters } from "@/lib/rateLimiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const limited = await applyRateLimit(request, limiters.login);

    if (limited) {
      return limited;
    }

    const body = await request.json();
    const parse = loginSchema.safeParse(body);
    if (!parse.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const password = parse.data.password;
    const email = parse.data.email.trim().toLowerCase();
    const db = await getDb();
    const user = await db.collection("users").findOne({ email });
    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    const token = signToken({ userId: user.id, role: user.role });
    await setAuthCookie(token);
    const { passwordHash: _p, _id, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
