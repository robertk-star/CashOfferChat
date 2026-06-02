import "./globals.css";

export const metadata = {
  title: "CashOfferChat",
  description: "AI seller intake assistant for cash home buyer websites.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
