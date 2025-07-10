import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2025 學青特會 - 盡",
  description: "一個幫助年輕基督徒制定和跟蹤聖經閱讀計劃的應用程序。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "讀經之旅",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "2025 學青特會",
    title: "2025 學青特會 - 盡",
    description: "一個幫助年輕基督徒制定和跟蹤聖經閱讀計劃的應用程序。",
  },
  twitter: {
    card: "summary",
    title: "2025 學青特會 - 盡",
    description: "一個幫助年輕基督徒制定和跟蹤聖經閱讀計劃的應用程序。",
  },
};

export function generateViewport() {
  return {
    themeColor: "#6366f1",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="讀經之旅" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.svg" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-128x128.svg" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-72x72.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/icon-72x72.svg" />
        
        {/* Splash Screens for iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.svg" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
