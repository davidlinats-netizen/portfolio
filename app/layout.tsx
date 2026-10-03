import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PortfolioProvider } from "@/components/PortfolioProvider";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";
import "./studio.css";
import "./particles.css";
import "./portrait.css";

const display = localFont({ src: "../public/assets/fonts/barlow-condensed-bold.ttf", variable: "--font-display", display: "swap", weight: "700" });
const body = localFont({ src: "../public/assets/fonts/manrope.ttf", variable: "--font-body", display: "swap", weight: "200 800" });
export const metadata: Metadata = {
  title: "DAVIID | Video editor & AI-content creator",
  description: siteConfig.introduction,
  openGraph: { title: "DAVIID | Your ideas Worth watching", description: siteConfig.introduction, type: "website" },
  robots: { index: true, follow: true },
};
const themeScript = `(function(){try{var t=localStorage.getItem('daviid-theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body className={`${display.variable} ${body.variable}`}><a className="skip-link" href="#main">Skip to content</a><ThemeProvider><PortfolioProvider>{children}</PortfolioProvider></ThemeProvider></body></html>;
}
