import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/checkout/simulate — DEV ONLY.
 * Simulates a successful payment when Razorpay keys are not configured.
 * Refused in production.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_available" }, { status: 403 });
  }
  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "draft") {
    return NextResponse.json({ error: "invalid_order" }, { status: 400 });
  }
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "in_review",
      razorpayPaymentId: "dev-simulated",
      paidAt: new Date(),
      adminNote: "DEV simulated payment — no real money moved.",
    },
  });
  return NextResponse.json({ ok: true });
}
