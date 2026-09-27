import type { Metadata } from "next";
import { LangProvider } from "@/lib/i18n";
import { Header, Footer } from "@/components/chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legal Pramaan — Sworn Affidavits & Legal Documents Online",
  description:
    "Create valid affidavits and rent agreements online for India. Guided builder in English with correct stamp-duty calculation. Starting in Gujarat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
