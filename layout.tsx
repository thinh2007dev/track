import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FruitVault — Blox Fruits Tracker",
  description: "Personal Blox Fruits account and inventory dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
