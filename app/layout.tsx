import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

declare global {
  interface Window {
    kakao: any;
  }
}

export const metadata: Metadata = {
  title: "Climb Pick",
  description: "내 주변 클라이밍장 찾기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-black">{children}</body>
    </html>
  );
}
