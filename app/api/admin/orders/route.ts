import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";

/** GET /api/admin/orders — admin order list with status filter + search. */
export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { id: { contains: q } },
              { customerName: { contains: q, mode: "insensitive" } },
              { customerPhone: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const revenue = await prisma.order.aggregate({
    where: { status: { in: ["paid", "in_review", "stamped", "delivered"] } },
    _sum: { totalPaise: true },
    _count: true,
  });

  return NextResponse.json({ orders, revenue });
}
