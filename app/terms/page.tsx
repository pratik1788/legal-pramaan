// v1 is English-only. Phase 2: move this copy into the i18n dictionary
// (terms.* keys) alongside a Gujarati translation.

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Terms of Service</h1>
      <div className="prose-sm mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
        <p><strong>1. We are not a law firm.</strong> Legal Pramaan is a document-preparation platform. We do not provide legal advice, create an advocate–client relationship, or represent anyone in court.</p>
        <p><strong>2. Your information.</strong> Documents are prepared from information you provide. You are responsible for ensuring it is accurate and complete.</p>
        <p><strong>3. Stamp duty.</strong> Duty is computed per the Gujarat Stamp Act, 1958. Rates may change; final responsibility for correct stamping rests with you.</p>
        <p><strong>4. Registration.</strong> Agreements longer than 11 months should be registered at the sub-registrar's office. Registration is your responsibility.</p>
        <p><strong>5. Refunds.</strong> Service fees are non-refundable once the document is generated and downloaded. Stamp duty is remitted to the government and is non-refundable.</p>
        <p><strong>6. Limitation of liability.</strong> To the maximum extent permitted by law, our liability is limited to the service fee you paid.</p>
      </div>
    </div>
  );
}
