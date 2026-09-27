import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { issueEstamp } from "@/lib/estamp";
import { requestEsign } from "@/lib/esign";

/** POST /api/razorpay/verify — verify signature, mark paid, kick off fulfilment. */
export async function POST(req: NextRequest) {
  const { orderId, razorpayPaymentId, razorpaySignature } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.razorpayOrderId || order.status !== "draft") {
    return NextResponse.json({ error: "invalid_order" }, { status: 400 });
  }
  const valid = verifyPaymentSignature(order.razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!valid) return NextResponse.json({ error: "bad_signature" }, { status: 400 });

  const payload = order.payload as {
    data: { ownerName: string; tenantName: string; propertyAddress: string };
    addons: { esign: boolean };
  };

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid", razorpayPaymentId, paidAt: new Date() },
  });

  // Fire fulfilment adapters (stubs until real integrations exist).
  const estamp = await issueEstamp({
    orderId: order.id,
    article: "30A",
    dutyPaise: order.stampDutyPaise,
    firstParty: payload.data.ownerName,
    secondParty: payload.data.tenantName,
    propertyAddress: payload.data.propertyAddress,
    state: "Gujarat",
  });
  if (payload.addons?.esign) {
    await requestEsign({
      orderId: order.id,
      documentPath: `generated:${order.id}`,
      signers: [{ name: payload.data.ownerName }, { name: payload.data.tenantName }],
    });
  }
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "in_review",
      adminNote: estamp.ok
        ? `E-stamp issued: ${estamp.certificateId}`
        : `E-STAMP PENDING MANUAL: ${estamp.reason}`,
    },
  });

  return NextResponse.json({ ok: true });
}
