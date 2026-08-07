import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./providers";
import { SITE } from "@/lib/constants";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Full-Stack Developer & AI Builder`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Computer Science student, full-stack developer, and AI builder. I design and ship fast, thoughtful web products — from AI-powered apps to polished business sites.",
  keywords: [
    "Abdur Rafay Khan",
    "Full-Stack Developer",
    "AI Builder",
    "Next.js",
    "TypeScript",
    "Portfolio",
    "Software Engineer",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Full-Stack Developer & AI Builder`,
    description:
      "I design and ship fast, thoughtful web products — from AI-powered apps to polished business sites.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Full-Stack Developer & AI Builder`,
    description:
      "I design and ship fast, thoughtful web products — from AI-powered apps to polished business sites.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
