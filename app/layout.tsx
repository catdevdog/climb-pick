import type { Metadata } from "next";
import Head from 'next/head';
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
    <html lang="ko">
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
      </Head>
      <body className="text-black">{children}</body>
    </html>
  );
}
