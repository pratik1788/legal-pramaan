import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

const STATUSES = ["NEW", "IN_PROGRESS", "DONE", "DECLINED"] as const;

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const requests = await prisma.changeRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const counts = await prisma.changeRequest.groupBy({
    by: ["status"],
    _count: true,
  });
  return NextResponse.json({ requests, counts });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const id = String(body.id ?? "");
  const status = String(body.status ?? "");
  const adminNote = String(body.adminNote ?? "").slice(0, 1000);
  if (!id || !(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const updated = await prisma.changeRequest.update({
    where: { id },
    data: { status: status as (typeof STATUSES)[number], adminNote },
  });
  return NextResponse.json({ ok: true, request: updated });
}
