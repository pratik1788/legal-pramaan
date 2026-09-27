/**
 * E-SIGN ADAPTER
 * ==============
 * Interface for Aadhaar-based eSign of documents.
 *
 * WHAT A REAL INTEGRATION NEEDS (see README "Integration checklist"):
 *  1. An Application Service Provider (ASP) agreement with a licensed
 *     Certifying Authority / eSign provider (e.g. eMudhra, NSDL e-Gov,
 *     Digio, Leegality) for Aadhaar eSign (OTP / biometric).
 *  2. Signer consent + Aadhaar eKYC flow per the IT Act, 2000.
 *  3. Store the signed document hash / audit trail with the order.
 *
 * Until then, the stub below records the intent and marks the order
 * "pending manual" so signing is arranged out-of-band.
 */

export interface EsignRequest {
  orderId: string;
  documentPath: string; // local path of the PDF to sign
  signers: Array<{ name: string; phone?: string }>;
}

export type EsignResult =
  | { ok: true; signedDocumentPath: string; auditId: string }
  | { ok: false; pendingManual: true; reason: string };

export async function requestEsign(req: EsignRequest): Promise<EsignResult> {
  // ---- REAL INTEGRATION POINT ----
  // const res = await fetch(process.env.ESIGN_API_URL!, { ... });
  // return { ok: true, signedDocumentPath: ..., auditId: ... };

  console.info(
    `[esign:stub] order=${req.orderId} doc=${req.documentPath} signers=${req.signers.map((s) => s.name).join(", ")}`,
  );
  return {
    ok: false,
    pendingManual: true,
    reason:
      "No live Aadhaar eSign provider configured. Arrange signing manually and upload the signed copy via the admin dashboard.",
  };
}
