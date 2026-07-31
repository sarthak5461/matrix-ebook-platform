import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const db = await getDb();
    const body = await request.json().catch(() => ({}));
    const { name, email, message } = body;
    if (!name || !email || !message)
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 },
      );
    await db.collection("contacts").insertOne({
      id: uuidv4(),
      name,
      email,
      message,
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
