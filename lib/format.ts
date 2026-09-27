/** Format paise as Indian rupees, e.g. 19900 -> "₹199.00" */
export function formatINR(paise: number): string {
  return "₹" + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format paise as whole rupees for duty display, e.g. 107500 -> "₹1,075" */
export function formatINRWhole(paise: number): string {
  return "₹" + Math.round(paise / 100).toLocaleString("en-IN");
}

/** Format YYYY-MM-DD as e.g. "15 January 2026" (en-IN). */
export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
