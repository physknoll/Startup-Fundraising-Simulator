import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Startup Fundraising Simulator | Model Your Fundraising Journey",
  description: "Model your startup's fundraising journey from pre-seed to Series C and beyond. Understand dilution, ESOP impact, and investor returns with our comprehensive fundraising simulator.",
  keywords: ["startup", "fundraising", "equity", "dilution", "ESOP", "Series A", "Series B", "Series C", "pre-seed", "seed", "venture capital", "cap table", "valuation"],
  authors: [{ name: "Harrison Knoll" }],
  creator: "Harrison Knoll",
  publisher: "Harrison Knoll",
  metadataBase: new URL('https://startup-fundraising-simulator.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Startup Fundraising Simulator | Model Your Fundraising Journey",
    description: "Model your startup's fundraising journey from pre-seed to Series C and beyond. Understand dilution, ESOP impact, and investor returns.",
    url: 'https://startup-fundraising-simulator.vercel.app',
    siteName: 'Startup Fundraising Simulator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Startup Fundraising Simulator - brought to you by Harrison Knoll',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Startup Fundraising Simulator | Model Your Fundraising Journey",
    description: "Model your startup's fundraising journey from pre-seed to Series C and beyond. Understand dilution, ESOP impact, and investor returns.",
    creator: '@harrisonknoll',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Startup Fundraising Simulator",
    "description": "Model your startup's fundraising journey from pre-seed to Series C and beyond. Understand dilution, ESOP impact, and investor returns.",
    "url": "https://startup-fundraising-simulator.vercel.app",
    "author": {
      "@type": "Person",
      "name": "Harrison Knoll",
      "url": "https://www.linkedin.com/in/scienceknoll/"
    },
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Fundraising round modeling",
      "Dilution calculations",
      "ESOP impact analysis",
      "Investor returns tracking",
      "Cap table visualization",
      "PDF report generation"
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="canonical" href="https://startup-fundraising-simulator.vercel.app" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fundraising Simulator" />
        <link rel="apple-touch-icon" href="/og-image.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
