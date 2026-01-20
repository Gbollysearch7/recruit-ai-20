import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recruit.ai - Find the Perfect Candidates",
  description: "AI-powered candidate search using Exa Websets. Find exactly who you're looking for.",
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
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
