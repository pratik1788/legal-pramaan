import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { AgreementPdf, AffidavitPdf } from "@/lib/pdf";
import type { AgreementData } from "@/lib/agreement";
import type { AffidavitData } from "@/lib/affidavit";

/**
 * GET /api/pdf/[id] — render the document PDF from the stored order payload.
 * v1: anyone with the order id can download (add phone-OTP check before launch).
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const payload = order.payload as unknown as { data: Record<string, unknown> };
  let buffer: Buffer;
  let filename: string;

  if (order.serviceType === "affidavit") {
    buffer = await renderToBuffer(
      AffidavitPdf({ data: payload.data as unknown as AffidavitData, orderId: order.id }),
    );
    filename = `affidavit-${order.id}.pdf`;
  } else {
    buffer = await renderToBuffer(
      AgreementPdf({ data: payload.data as unknown as AgreementData, orderId: order.id }),
    );
    filename = `rent-agreement-${order.id}.pdf`;
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
