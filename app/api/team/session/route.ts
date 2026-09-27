import { NextRequest, NextResponse } from "next/server";
import {
  verifyTeamPasscode,
  createTeamSessionCookie,
  teamCookieName,
  isTeamAuthenticated,
} from "@/lib/teamAuth";

export async function POST(req: NextRequest) {
  const { passcode } = await req.json();
  if (!verifyTeamPasscode(String(passcode ?? ""))) {
    return NextResponse.json({ error: "invalid_passcode" }, { status: 401 });
  }
  const { name, value } = createTeamSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30d — the team shouldn't have to re-enter often
  });
  return res;
}

export async function GET() {
  return NextResponse.json({ authenticated: isTeamAuthenticated() });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(teamCookieName(), "", { path: "/", maxAge: 0 });
  return res;
}
