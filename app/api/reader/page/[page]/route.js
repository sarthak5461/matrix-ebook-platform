import { requireUser } from "@/lib/auth";
import { extractPageAsPdf } from "@/lib/pdfStorage";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { page } = await params;
    const pageNum = parseInt(page, 10);
    const auth = await requireUser();
    if (auth.error) return json({ error: auth.error }, auth.status);
    if (!auth.user.purchasedBook)
      return NextResponse.json({ error: "Purchase required" }, { status: 402 });

    if (!Number.isFinite(pageNum) || pageNum < 1)
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    try {
      const bytes = await extractPageAsPdf(pageNum - 1);
      const res = new NextResponse(bytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "Cache-Control":
            "private, no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
          "X-Frame-Options": "DENY",
        },
      });
      return res;
    } catch (e) {
      return NextResponse.json(
        { error: e.message || "Failed" },
        { status: 400 },
      );
    }
  } catch (e) {
    console.error("PDF extraction failed:", e);
    return NextResponse.json(
      { error: "Unable to load requested page." },
      { status: 400 },
    );
  }
}
