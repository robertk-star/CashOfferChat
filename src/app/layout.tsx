import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CashOfferChat | AI Seller Intake Assistant",
  description: "AI chat intake for cash home buyer websites.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
