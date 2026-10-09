import { AuthProvider } from "@/components/auth-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeBoot } from "@/components/theme";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4178";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "叨叨占卜师 Daodao Tarot",
    template: "%s · 叨叨占卜师",
  },
  description:
    "叨叨占卜师（Daodao Tarot）是一款可直接使用的塔罗占卜应用。完整 78 张伟特塔罗，支持每日一牌、三牌阵、关系、事业与凯尔特十字。占卜结果仅供娱乐与自我反思。",
  keywords: ["塔罗", "塔罗牌", "占卜", "伟特", "凯尔特十字", "叨叨占卜师", "Daodao Tarot", "tarot"],
  openGraph: {
    title: "叨叨占卜师 Daodao Tarot",
    description: "把问题放下，让七十八张伟特塔罗一张一张说给你听。仅供娱乐与自我反思。",
    locale: "zh_CN",
    type: "website",
    siteName: "叨叨占卜师",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={`${display.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=localStorage.getItem("daodao-theme");var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");var root=document.documentElement;root.classList.toggle("dark",theme==="dark");root.style.colorScheme=theme;}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* next/font subsets for Noto Serif SC do not include Chinese glyphs. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <ThemeBoot />
        <I18nProvider>
          <AuthProvider>
            <div className="starfield" aria-hidden />
            <div className="relative z-10 flex min-h-full flex-col">
              <Suspense fallback={<div className="h-16 border-b border-primary/20" />}>
                <SiteHeader />
              </Suspense>
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
