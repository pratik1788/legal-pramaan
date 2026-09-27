import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * POST /api/admin/upload — attach the manually-issued stamped PDF to an order.
 * v1 stores files on local disk (./uploads, volume-mounted in Docker).
 * For production scale, swap to S3-compatible storage (see README).
 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const orderId = String(form.get("orderId") ?? "");
  const file = form.get("file") as File | null;

  if (!orderId || !file) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "pdf_only" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await mkdir(UPLOAD_DIR, { recursive: true });
  const safeName = `${orderId}-stamped.pdf`;
  const dest = path.join(UPLOAD_DIR, safeName);
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));

  await prisma.order.update({
    where: { id: orderId },
    data: { stampedPdfPath: safeName },
  });

  return NextResponse.json({ ok: true, path: safeName });
}

/** GET /api/admin/upload?orderId=… — download the attached stamped PDF (admin only). */
export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const orderId = new URL(req.url).searchParams.get("orderId");
  const order = orderId ? await prisma.order.findUnique({ where: { id: orderId } }) : null;
  if (!order?.stampedPdfPath) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { readFile } = await import("fs/promises");
  const buf = await readFile(path.join(UPLOAD_DIR, path.basename(order.stampedPdfPath)));
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.stampedPdfPath}"`,
    },
  });
}
