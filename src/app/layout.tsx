import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Stock Search",
  description: "Sign in and look up a stock's opening price.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
        <link rel="stylesheet" href="/tokens.css" />
        <link rel="stylesheet" href="/components.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
