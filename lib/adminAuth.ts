import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "glp_admin";

/**
 * v1 admin auth: a single env-var password, verified via an HMAC-signed
 * httpOnly cookie. No user accounts in v1. For production, put /admin
 * behind your identity provider or add proper user auth.
 */
function expectedToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update(`admin:${password}`).digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminSessionCookie(): { name: string; value: string } {
  return { name: COOKIE_NAME, value: expectedToken() };
}

export function isAdminAuthenticated(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expectedToken());
  return a.length === b.length && timingSafeEqual(a, b);
}

export function adminCookieName(): string {
  return COOKIE_NAME;
}
