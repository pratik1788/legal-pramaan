import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeStampDuty } from "@/lib/stampDuty";
import { PRICING, buildPriceBreakup } from "@/lib/pricing";

/**
 * POST /api/orders — create a draft order from wizard data.
 * Price is RECOMPUTED server-side from the submitted terms; the client's
 * numbers are never trusted.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceType, data, contact, addons, price } = body ?? {};

    if (serviceType !== "rent_agreement") {
      return NextResponse.json({ error: "unsupported_service" }, { status: 400 });
    }
    if (!data?.ownerName?.trim() || !data?.tenantName?.trim() || !data?.propertyAddress?.trim()) {
      return NextResponse.json({ error: "missing_parties" }, { status: 400 });
    }
    if (!contact?.name?.trim() || !/^[6-9]\d{9}$/.test(String(contact?.phone ?? "").trim())) {
      return NextResponse.json({ error: "invalid_contact" }, { status: 400 });
    }

    const monthlyRent = Math.max(0, Number(data.monthlyRent) || 0);
    const durationMonths = Math.min(60, Math.max(1, Number(data.durationMonths) || 11));
    const deposit = Math.max(0, Number(data.deposit) || 0);

    // Server-side price truth:
    const duty = computeStampDuty({ article: "30A", monthlyRentRs: monthlyRent, durationMonths, depositRs: deposit });
    const serviceFee = PRICING.rentAgreementServiceFeePaise();
    const addonsPaise =
      (addons?.esign ? PRICING.esignPaise() : 0) + (addons?.notary ? PRICING.notaryPaise() : 0);
    const breakup = buildPriceBreakup(serviceFee, duty.dutyPaise, addonsPaise);

    // Reject if the client tried to undercut the computed total.
    if (Number(price?.totalPaise) !== breakup.totalPaise) {
      return NextResponse.json(
        { error: "price_mismatch", expected: breakup },
        { status: 400 },
      );
    }

    const order = await prisma.order.create({
      data: {
        serviceType: "rent_agreement",
        status: "draft",
        customerName: contact.name.trim(),
        customerPhone: contact.phone.trim(),
        customerEmail: contact.email?.trim() || null,
        payload: {
          data: { ...data, monthlyRent, durationMonths, deposit },
          addons: { esign: Boolean(addons?.esign), notary: Boolean(addons?.notary) },
          dutyBreakdown: duty.breakdown,
        },
        serviceFeePaise: breakup.serviceFeePaise,
        stampDutyPaise: breakup.stampDutyPaise,
        addonsPaise: breakup.addonsPaise,
        totalPaise: breakup.totalPaise,
      },
    });

    return NextResponse.json({ orderId: order.id, totalPaise: order.totalPaise });
  } catch (e) {
    console.error("POST /api/orders", e);
    return NextResponse.json({ error: "order_failed" }, { status: 500 });
  }
}
