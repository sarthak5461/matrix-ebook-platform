import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { ensureSamplePdf, getPdfInfo } from "@/lib/pdfStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireUser();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    if (!auth.user.purchasedBook)
      return NextResponse.json({ error: "Purchase required" }, { status: 402 });
    await ensureSamplePdf();
    const info = await getPdfInfo();
    return NextResponse.json({
      ...info,
      title: process.env.EBOOK_TITLE,
      author: process.env.EBOOK_AUTHOR,
    });
  } catch (error) {
    console.error("Reader info failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
