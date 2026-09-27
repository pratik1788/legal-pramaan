import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { AgreementPdf } from "@/lib/pdf";
import type { AgreementData } from "@/lib/agreement";

/**
 * GET /api/pdf/[id] — render the agreement PDF from the stored order payload.
 * v1: anyone with the order id can download (add phone-OTP check before launch).
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const payload = order.payload as unknown as { data: AgreementData };
  const buffer = await renderToBuffer(AgreementPdf({ data: payload.data, orderId: order.id }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rent-agreement-${order.id}.pdf"`,
    },
  });
}
