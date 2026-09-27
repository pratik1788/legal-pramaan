import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";

/** POST /api/razorpay/order — create a Razorpay order for a draft order. */
export async function POST(req: NextRequest) {
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: "razorpay_not_configured" }, { status: 400 });
  }
  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "draft") {
    return NextResponse.json({ error: "invalid_order" }, { status: 400 });
  }
  try {
    const rzpOrder = await createRazorpayOrder(order.totalPaise, order.id);
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id as string },
    });
    return NextResponse.json({ razorpayOrderId: rzpOrder.id, amount: order.totalPaise });
  } catch (e) {
    console.error("razorpay order", e);
    return NextResponse.json({ error: "gateway_error" }, { status: 502 });
  }
}
