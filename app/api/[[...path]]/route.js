import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import {
  hashPassword,
  comparePassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  getCurrentUser,
  requireUser,
  requireAdmin,
} from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
} from "@/lib/validators";
import {
  ensureSamplePdf,
  getPdfInfo,
  extractPageAsPdf,
  replacePdf,
  getPdfBytes,
} from "@/lib/pdfStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cors(res) {
  res.headers.set(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGINS || "*",
  );
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");
  return res;
}
function json(data, status = 200) {
  return cors(NextResponse.json(data, { status }));
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }));
}

// ---------- ADMIN SEED ----------
let seeded = false;
async function seedAdmin() {
  if (seeded) return;
  const db = await getDb();
  const email = (process.env.ADMIN_EMAIL || "admin@matrix.com").toLowerCase();
  const existing = await db.collection("users").findOne({ email });
  if (!existing) {
    const password = await hashPassword(
      process.env.ADMIN_PASSWORD || "Admin@123",
    );
    await db.collection("users").insertOne({
      id: uuidv4(),
      name: process.env.ADMIN_NAME || "Site Admin",
      email,
      password,
      role: "admin",
      purchasedBook: true,
      createdAt: new Date(),
    });
    console.log("Seeded admin:", email);
  } else if (existing.role !== "admin") {
    await db
      .collection("users")
      .updateOne(
        { id: existing.id },
        { $set: { role: "admin", purchasedBook: true } },
      );
  }
  seeded = true;
}

// ---------- ROUTER ----------
async function handler(request, { params }) {
  const { path = [] } = await params;
  const route = "/" + path.join("/");
  const method = request.method;

  try {
    await seedAdmin();
    const db = await getDb();

    // ===== Health =====
    if (route === "/" || route === "/root") {
      return json({ ok: true, service: "Matrix Structural Analysis API" });
    }

    // ===== Auth =====
    if (route === "/auth/register" && method === "POST") {
      const body = await request.json();
      const parse = registerSchema.safeParse(body);
      if (!parse.success)
        return json(
          { error: "Invalid input", details: parse.error.flatten() },
          400,
        );
      const { name, email, password } = parse.data;
      const existing = await db.collection("users").findOne({ email });
      if (existing) return json({ error: "Email already registered" }, 409);
      const user = {
        id: uuidv4(),
        name,
        email,
        password: await hashPassword(password),
        role: "user",
        purchasedBook: false,
        createdAt: new Date(),
      };
      await db.collection("users").insertOne(user);
      const token = signToken({ userId: user.id, role: user.role });
      await setAuthCookie(token);
      const { password: _p, _id, ...safe } = user;
      return json({ user: safe });
    }

    if (route === "/auth/login" && method === "POST") {
      const body = await request.json();
      const parse = loginSchema.safeParse(body);
      if (!parse.success) return json({ error: "Invalid input" }, 400);
      const { email, password } = parse.data;
      const user = await db.collection("users").findOne({ email });
      if (!user) return json({ error: "Invalid credentials" }, 401);
      const ok = await comparePassword(password, user.password);
      if (!ok) return json({ error: "Invalid credentials" }, 401);
      const token = signToken({ userId: user.id, role: user.role });
      await setAuthCookie(token);
      const { password: _p, _id, ...safe } = user;
      return json({ user: safe });
    }

    if (route === "/auth/logout" && method === "POST") {
      await clearAuthCookie();
      return json({ ok: true });
    }

    if (route === "/auth/me" && method === "GET") {
      const u = await getCurrentUser();
      return json({ user: u });
    }

    if (route === "/auth/forgot-password" && method === "POST") {
      const body = await request.json();
      const parse = forgotSchema.safeParse(body);
      if (!parse.success) return json({ error: "Invalid input" }, 400);
      const user = await db
        .collection("users")
        .findOne({ email: parse.data.email });
      // Always respond ok to avoid user-enumeration
      if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
        await db.collection("password_resets").insertOne({
          id: uuidv4(),
          userId: user.id,
          token,
          expiresAt,
          used: false,
          createdAt: new Date(),
        });
        const base = process.env.NEXT_PUBLIC_BASE_URL || "";
        const link = `${base}/reset-password?token=${token}`;
        await sendEmail({
          to: user.email,
          subject: "Reset your Matrix Structural Analysis password",
          html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, ignore this email.</p>`,
        });
      }
      return json({
        ok: true,
        message: "If the email exists, a reset link has been sent.",
      });
    }

    if (route === "/auth/reset-password" && method === "POST") {
      const body = await request.json();
      const parse = resetSchema.safeParse(body);
      if (!parse.success) return json({ error: "Invalid input" }, 400);
      const { token, password } = parse.data;
      const rec = await db
        .collection("password_resets")
        .findOne({ token, used: false });
      if (!rec) return json({ error: "Invalid or expired token" }, 400);
      if (new Date(rec.expiresAt) < new Date())
        return json({ error: "Token expired" }, 400);
      const hashed = await hashPassword(password);
      await db
        .collection("users")
        .updateOne({ id: rec.userId }, { $set: { password: hashed } });
      await db
        .collection("password_resets")
        .updateOne({ id: rec.id }, { $set: { used: true } });
      return json({ ok: true });
    }

    // ===== Payments =====

    // ===== Ebook / Reader (protected) =====
    if (route === "/reader/info" && method === "GET") {
      const auth = await requireUser();
      if (auth.error) return json({ error: auth.error }, auth.status);
      if (!auth.user.purchasedBook)
        return json({ error: "Purchase required" }, 402);
      await ensureSamplePdf();
      const info = await getPdfInfo();
      return json({
        ...info,
        title: process.env.EBOOK_TITLE,
        author: process.env.EBOOK_AUTHOR,
      });
    }

    if (route.startsWith("/reader/page/") && method === "GET") {
      const auth = await requireUser();
      if (auth.error) return json({ error: auth.error }, auth.status);
      if (!auth.user.purchasedBook)
        return json({ error: "Purchase required" }, 402);
      const pageStr = route.replace("/reader/page/", "");
      const pageNum = parseInt(pageStr, 10);
      if (!Number.isFinite(pageNum) || pageNum < 1)
        return json({ error: "Invalid page" }, 400);
      try {
        const bytes = await extractPageAsPdf(pageNum - 1);
        const res = new NextResponse(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
            "Cache-Control": "private, no-store, max-age=0",
            "X-Content-Type-Options": "nosniff",
          },
        });
        return cors(res);
      } catch (e) {
        return json({ error: e.message || "Failed" }, 400);
      }
    }

    // ===== Admin =====
    if (route === "/admin/stats" && method === "GET") {
      const auth = await requireAdmin();
      if (auth.error) return json({ error: auth.error }, auth.status);
      const totalUsers = await db
        .collection("users")
        .countDocuments({ role: { $ne: "admin" } });
      const totalPurchases = await db
        .collection("purchases")
        .countDocuments({ status: "paid" });
      const agg = await db
        .collection("purchases")
        .aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray();
      const totalRevenuePaise = agg[0]?.total || 0;
      return json({
        totalUsers,
        totalPurchases,
        totalRevenue: totalRevenuePaise / 100,
      });
    }

    if (route === "/admin/users" && method === "GET") {
      const auth = await requireAdmin();
      if (auth.error) return json({ error: auth.error }, auth.status);
      const users = await db
        .collection("users")
        .find({})
        .sort({ createdAt: -1 })
        .limit(1000)
        .toArray();
      return json({ users: users.map(({ _id, password, ...u }) => u) });
    }

    if (route === "/admin/purchases" && method === "GET") {
      const auth = await requireAdmin();
      if (auth.error) return json({ error: auth.error }, auth.status);
      const purchases = await db
        .collection("purchases")
        .find({})
        .sort({ createdAt: -1 })
        .limit(2000)
        .toArray();
      const userIds = [...new Set(purchases.map((p) => p.userId))];
      const users = await db
        .collection("users")
        .find({ id: { $in: userIds } })
        .toArray();
      const byId = Object.fromEntries(users.map((u) => [u.id, u]));
      const enriched = purchases.map(({ _id, ...p }) => ({
        ...p,
        userName: byId[p.userId]?.name || "—",
        userEmail: byId[p.userId]?.email || "—",
      }));
      return json({ purchases: enriched });
    }

    if (route === "/admin/export.csv" && method === "GET") {
      const auth = await requireAdmin();
      if (auth.error) return json({ error: auth.error }, auth.status);
      const purchases = await db
        .collection("purchases")
        .find({ status: "paid" })
        .sort({ purchasedAt: -1 })
        .toArray();
      const userIds = [...new Set(purchases.map((p) => p.userId))];
      const users = await db
        .collection("users")
        .find({ id: { $in: userIds } })
        .toArray();
      const byId = Object.fromEntries(users.map((u) => [u.id, u]));
      const rows = [
        [
          "PurchaseID",
          "UserName",
          "UserEmail",
          "RazorpayOrderId",
          "RazorpayPaymentId",
          "AmountINR",
          "Status",
          "PurchasedAt",
        ],
      ];
      for (const p of purchases) {
        rows.push([
          p.id,
          byId[p.userId]?.name || "",
          byId[p.userId]?.email || "",
          p.razorpayOrderId,
          p.razorpayPaymentId || "",
          (p.amount / 100).toFixed(2),
          p.status,
          p.purchasedAt ? new Date(p.purchasedAt).toISOString() : "",
        ]);
      }
      const csv = rows
        .map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");
      const res = new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sales_report_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
      return cors(res);
    }

    if (route === "/admin/upload-pdf" && method === "POST") {
      const auth = await requireAdmin();
      if (auth.error) return json({ error: auth.error }, auth.status);
      const form = await request.formData();
      const file = form.get("file");
      if (!file) return json({ error: "No file" }, 400);
      const buf = Buffer.from(await file.arrayBuffer());
      await replacePdf(buf);
      const info = await getPdfInfo();
      return json({ ok: true, ...info });
    }

    // ===== Contact =====
    if (route === "/contact" && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const { name, email, message } = body;
      if (!name || !email || !message)
        return json({ error: "All fields required" }, 400);
      await db.collection("contacts").insertOne({
        id: uuidv4(),
        name,
        email,
        message,
        createdAt: new Date(),
      });
      return json({ ok: true });
    }

    return json({ error: `Route ${route} not found` }, 404);
  } catch (e) {
    console.error("API error:", e);
    return json({ error: "Internal server error", message: e.message }, 500);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
