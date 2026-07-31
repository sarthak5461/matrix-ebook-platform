import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { replacePdf, getPdfInfo } from "@/lib/pdfStorage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file upload" },
        { status: 400 },
      );
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }
    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "PDF exceeds 25 MB limit" },
        { status: 400 },
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    await replacePdf(buf);
    const info = await getPdfInfo();
    return NextResponse.json({ ok: true, ...info });
  } catch (error) {
    console.error("PDF upload failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
