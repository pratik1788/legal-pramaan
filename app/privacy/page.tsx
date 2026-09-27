// v1 is English-only. Phase 2: move this copy into the i18n dictionary
// (privacy.* keys) alongside a Gujarati translation.

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
        <p><strong>1. What we collect.</strong> Name, mobile number, email, agreement details and payment information — only what is needed to fulfil your order.</p>
        <p><strong>2. DPDP Act, 2023.</strong> We follow the principles of India's Digital Personal Data Protection Act, 2023: consent, purpose limitation and data minimisation.</p>
        <p><strong>3. Sharing.</strong> We do not sell your data. Data is shared only with payment (Razorpay), e-stamp/e-sign providers, and where required by law.</p>
        <p><strong>4. Security.</strong> Data is transmitted over encrypted connections with controlled access.</p>
        <p><strong>5. Your rights.</strong> Contact us to access, correct or delete your data — we will act within a reasonable time.</p>
      </div>
    </div>
  );
}
