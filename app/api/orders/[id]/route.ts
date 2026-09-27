import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

/** Public-safe order view (for the track page). */
function publicView(order: Record<string, unknown>) {
  return {
    id: order.id,
    serviceType: order.serviceType,
    status: order.status,
    trackingNote: order.trackingNote,
    hasStampedCopy: Boolean(order.stampedPdfPath),
    createdAt: order.createdAt,
    serviceFeePaise: order.serviceFeePaise,
    stampDutyPaise: order.stampDutyPaise,
    addonsPaise: order.addonsPaise,
    totalPaise: order.totalPaise,
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (isAdminAuthenticated()) return NextResponse.json({ order });
  return NextResponse.json({ order: publicView(order as unknown as Record<string, unknown>) });
}

/**
 * PATCH /api/orders/[id] — admin only.
 * Body: { status?, trackingNote?, adminNote? }
 * Allowed transitions: draft→cancelled, paid→in_review→stamped→delivered, any→cancelled.
 */
const ALLOWED: Record<string, string[]> = {
  draft: ["cancelled"],
  paid: ["in_review", "cancelled"],
  in_review: ["stamped", "cancelled"],
  stamped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.status && body.status !== order.status) {
    if (!ALLOWED[order.status]?.includes(body.status)) {
      return NextResponse.json({ error: "invalid_transition" }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (typeof body.trackingNote === "string") updates.trackingNote = body.trackingNote;
  if (typeof body.adminNote === "string") updates.adminNote = body.adminNote;

  const updated = await prisma.order.update({ where: { id: params.id }, data: updates });
  return NextResponse.json({ order: updated });
}
