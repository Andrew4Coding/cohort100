import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family 100",
  description: "Indonesian Family 100 Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full">{children}</body>
    </html>
  );
}