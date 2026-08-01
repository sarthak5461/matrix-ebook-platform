import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb } from "./mongodb";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "msa_token";

export function hashPassword(pw) {
  return bcrypt.hash(pw, 10);
}
export function comparePassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
    issuer: "matrix-book-app",
    audience: "matrix-book-users",
  });
}
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return null;
  }
}

export async function setAuthCookie(token) {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const c = await cookies();
  c.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getCurrentUser() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.userId) return null;
  const db = await getDb();
  const user = await db.collection("users").findOne({ id: payload.userId });
  if (!user) return null;
  const { passwordHash, _id, ...safe } = user;
  return safe;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) return { error: "Unauthorized", status: 401 };
  return { user: u };
}

export async function requireAdmin() {
  const r = await requireUser();
  if (r.error) return r;
  if (r.user.role !== "admin") return { error: "Forbidden", status: 403 };
  return { user: r.user };
}
