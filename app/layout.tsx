import type { Metadata } from "next";
import { LangProvider } from "@/lib/i18n";
import { Header, Footer } from "@/components/chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "GujaratLegal — Online Legal Documentation for Gujarat",
  description:
    "Create valid rent agreements online for Gujarat. Guided builder in English with correct Gujarat Stamp Act stamp-duty calculation.",
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
