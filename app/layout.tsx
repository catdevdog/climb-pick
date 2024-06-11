import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

declare global {
  interface Window {
    kakao: any;
  }
}

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
