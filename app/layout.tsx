import type { Metadata } from "next";
import Script from "next/script";
import Head from "next/head";
import "./globals.css";

export const metadata: Metadata = {
  title: "클라임픽",
  description: "내 주변 클라이밍장 찾기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&autoload=false&libraries=services`;

  return (
    <html lang="ko">
      <head>
        <Script src={KAKAO_SDK_URL} strategy="beforeInteractive" />
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/android-chrome-192x192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="512x512"
            href="/android-chrome-512x512.png"
          />
        </Head>
      </head>
      <body className="text-black">{children}</body>
    </html>
  );
}
