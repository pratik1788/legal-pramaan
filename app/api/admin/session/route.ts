import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, createAdminSessionCookie, adminCookieName, isAdminAuthenticated } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!verifyAdminPassword(String(password ?? ""))) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  const { name, value } = createAdminSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
  });
  return res;
}

export async function GET() {
  return NextResponse.json({ authenticated: isAdminAuthenticated() });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName(), "", { path: "/", maxAge: 0 });
  return res;
}
