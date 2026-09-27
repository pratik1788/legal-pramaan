/**
 * E-STAMP ADAPTER
 * ================
 * Interface for issuing e-stamp certificates for Gujarat orders.
 *
 * WHAT A REAL INTEGRATION NEEDS (see README "Integration checklist"):
 *  1. SHCIL (Stock Holding Corporation of India Ltd.) — the Central Record
 *     Keeping Agency for e-stamping in Gujarat — authorised distributor /
 *     partner status for your company, OR a tie-up with an authorised
 *     stamp vendor / bank collection centre.
 *  2. API or portal access to generate the e-stamp certificate with the
 *     correct Schedule-I article (e.g. 30A), duty amount, and party details.
 *  3. A process to merge/attach the e-stamp certificate with the drafted
 *     document and deliver it (download + doorstep courier).
 *
 * Until then, the stub below records the intent and marks the order
 * "pending manual" so the admin fulfils it by hand and uploads the
 * stamped PDF via the admin dashboard.
 */

export interface EstampRequest {
  orderId: string;
  article: string; // e.g. "30A"
  dutyPaise: number;
  firstParty: string; // owner
  secondParty: string; // tenant
  propertyAddress: string;
  state: "Gujarat";
}

export type EstampResult =
  | { ok: true; certificateId: string; issuedAt: string }
  | { ok: false; pendingManual: true; reason: string };

export async function issueEstamp(req: EstampRequest): Promise<EstampResult> {
  // ---- REAL INTEGRATION POINT ----
  // const res = await fetch(process.env.ESTAMP_API_URL!, { ... });
  // return { ok: true, certificateId: res.certificateId, issuedAt: ... };

  // Stub: log the request and defer to manual fulfilment.
  console.info(
    `[estamp:stub] order=${req.orderId} article=${req.article} dutyPaise=${req.dutyPaise} parties="${req.firstParty}" / "${req.secondParty}"`,
  );
  return {
    ok: false,
    pendingManual: true,
    reason:
      "No live SHCIL integration configured. Admin must issue the e-stamp manually and attach the stamped PDF to the order.",
  };
}
