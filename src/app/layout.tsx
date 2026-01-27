import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://talist.ai';

export const metadata: Metadata = {
  title: {
    default: "talist.ai - AI-Powered Candidate Search",
    template: "%s | talist.ai",
  },
  description: "Find the perfect candidates with AI-powered search. Describe who you need in plain English and let our AI search the entire web to find people who match.",
  keywords: ["recruiting", "candidate search", "AI hiring", "talent acquisition", "Exa AI"],
  authors: [{ name: "talist.ai" }],
  creator: "talist.ai",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "talist.ai",
    title: "talist.ai - AI-Powered Candidate Search",
    description: "Find the perfect candidates with AI-powered search. Describe who you need in plain English and let our AI search the entire web to find people who match.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "talist.ai - AI-Powered Candidate Search",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "talist.ai - AI-Powered Candidate Search",
    description: "Find the perfect candidates with AI-powered search.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined|Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
