import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProgress } from "@/components/scroll";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const SITE = "https://safesquare.app";
const TITLE = "SafeSquare – Premium Therapy & Consulting Rooms for Mental Health Practitioners";
const DESCRIPTION =
  "Flexible hourly room rentals designed for therapists, psychologists, counselors, and healthcare professionals. Premium facilities, real-time booking, secure environment.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s | SafeSquare" },
  description: DESCRIPTION,
  keywords: [
    "Therapy Room Rental", "Consulting Room Rental", "Mental Health Clinic Rooms",
    "Practitioner Workspace", "Therapy Space Rental", "Hourly Clinic Rooms",
    "Wellness", "Psychology Practice",
  ],
  authors: [{ name: "SafeSquare" }],
  creator: "SafeSquare",
  openGraph: {
    type: "website", locale: "en_US", url: SITE, siteName: "SafeSquare",
    title: TITLE, description: DESCRIPTION,
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "SafeSquare" }],
  },
  twitter: {
    card: "summary_large_image", title: TITLE, description: DESCRIPTION,
    images: ["/og.svg"], creator: "@safesquare",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0A3D62",
  width: "device-width", initialScale: 1, maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ScrollProgress />
        <Providers>
          <SiteHeader />
          <main className="relative z-10">{children}</main>
          <SiteFooter />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SafeSquare",
              url: SITE,
              logo: `${SITE}/logo.png`,
              sameAs: [],
              description: DESCRIPTION,
            }),
          }}
        />
      </body>
    </html>
  );
}
