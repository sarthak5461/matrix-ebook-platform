import fs from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const PDF_DIR = path.join(process.cwd(), "private-storage");
export const PDF_PATH = path.join(PDF_DIR, "ebook.pdf");

export async function ensureSamplePdf() {
  try {
    await fs.access(PDF_PATH);
    return;
  } catch {}
  await fs.mkdir(PDF_DIR, { recursive: true });

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const body = await pdf.embedFont(StandardFonts.Helvetica);
  const chapters = [
    "Introduction to Matrix Structural Analysis",
    "Fundamentals of Matrix Algebra",
    "Stiffness Method",
    "Flexibility Method",
    "Analysis of Trusses",
    "Analysis of Beams",
    "Analysis of Frames",
    "Computer Implementation",
    "Case Studies",
    "Advanced Topics",
  ];
  chapters.forEach((title, i) => {
    const page = pdf.addPage([595, 842]);
    page.drawText(`Chapter ${i + 1}`, {
      x: 60,
      y: 760,
      size: 18,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(title, {
      x: 60,
      y: 720,
      size: 26,
      font,
      color: rgb(0.05, 0.1, 0.4),
    });
    const lorem =
      "This is a placeholder chapter for the Matrix Structural Analysis ebook. Replace this PDF from the Admin dashboard with the real book. The reader UI, page navigation, zoom, and reading progress all work with any PDF you upload here.";
    let y = 660;
    for (let line = 0; line < 20; line++) {
      page.drawText(lorem, {
        x: 60,
        y,
        size: 11,
        font: body,
        color: rgb(0, 0, 0),
        maxWidth: 475,
        lineHeight: 14,
      });
      y -= 30;
      if (y < 80) break;
    }
    page.drawText(`Page ${i + 1} of ${chapters.length}`, {
      x: 260,
      y: 40,
      size: 10,
      font: body,
      color: rgb(0.5, 0.5, 0.5),
    });
  });
  const bytes = await pdf.save();
  await fs.writeFile(PDF_PATH, bytes);
}

export async function getPdfBytes() {
  if (process.env.NODE_ENV !== "production") {
    await ensureSamplePdf();
  }

  return fs.readFile(PDF_PATH);
}

export async function getPdfInfo() {
  const bytes = await getPdfBytes();
  const doc = await PDFDocument.load(bytes);
  return { pageCount: doc.getPageCount() };
}

export async function extractPageAsPdf(pageIndex) {
  const bytes = await getPdfBytes();
  const src = await PDFDocument.load(bytes);
  if (pageIndex < 0 || pageIndex >= src.getPageCount())
    throw new Error("Invalid page");
  const out = await PDFDocument.create();
  const [copied] = await out.copyPages(src, [pageIndex]);
  out.addPage(copied);
  return await out.save();
}

export async function replacePdf(buffer) {
  await fs.mkdir(PDF_DIR, { recursive: true });

  // Validate that it's a real PDF
  const pdf = await PDFDocument.load(buffer);

  if (pdf.getPageCount() === 0) {
    throw new Error("PDF contains no pages.");
  }

  const tempPath = path.join(PDF_DIR, "ebook.tmp.pdf");

  // Write to a temporary file first
  await fs.writeFile(tempPath, buffer);

  // Atomically replace the old PDF
  await fs.rename(tempPath, PDF_PATH);
}
