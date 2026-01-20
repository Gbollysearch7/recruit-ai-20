import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "talist.ai - Find the Perfect Candidates",
  description: "AI-powered candidate search. Find exactly who you're looking for.",
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
        {children}
      </body>
    </html>
  );
}
