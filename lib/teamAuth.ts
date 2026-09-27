import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "glp_team";

/**
 * Team gate: a single shared passcode (TEAM_PASSCODE env var) for the
 * business team posting change requests at /team. Same HMAC-signed
 * httpOnly cookie pattern as admin auth. This is a low-friction gate to
 * keep random visitors out, not a substitute for real user accounts.
 */
function expectedToken(): string {
  const passcode = process.env.TEAM_PASSCODE ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update(`team:${passcode}`).digest("hex");
}

export function verifyTeamPasscode(passcode: string): boolean {
  const expected = process.env.TEAM_PASSCODE ?? "";
  if (!expected) return false;
  const a = Buffer.from(passcode);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createTeamSessionCookie(): { name: string; value: string } {
  return { name: COOKIE_NAME, value: expectedToken() };
}

export function isTeamAuthenticated(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expectedToken());
  return a.length === b.length && timingSafeEqual(a, b);
}

export function teamCookieName(): string {
  return COOKIE_NAME;
}
