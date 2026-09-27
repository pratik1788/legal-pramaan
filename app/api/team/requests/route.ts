import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isTeamAuthenticated } from "@/lib/teamAuth";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

// Team-visible list, newest first. Only title/description/status/adminNote
// are exposed — no internal fields.
export async function GET() {
  if (!isTeamAuthenticated()) return unauthorized();
  const requests = await prisma.changeRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      description: true,
      authorName: true,
      status: true,
      adminNote: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  if (!isTeamAuthenticated()) return unauthorized();
  const body = await req.json();
  const title = String(body.title ?? "").trim().slice(0, 120);
  const description = String(body.description ?? "").trim().slice(0, 4000);
  const authorName = String(body.authorName ?? "").trim().slice(0, 60);
  if (!title || !description) {
    return NextResponse.json({ error: "title_and_description_required" }, { status: 400 });
  }
  const created = await prisma.changeRequest.create({
    data: { title, description, authorName },
    select: { id: true },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
