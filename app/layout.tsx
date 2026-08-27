import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Explore a production-grade concept for supply-chain sensing, private decision intelligence, governed simulation, and measured value.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "resilience-os-clickflow.kearney-4763.chatgpt.site";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const socialImage = `${protocol}://${host}/og.png`;

  return {
    title: "Resilience OS — Supply-chain decision intelligence",
    description,
    applicationName: "Resilience OS",
    category: "Supply-chain decision intelligence",
    robots: { index: false, follow: false },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      title: "Resilience OS — Signal to measured value",
      description,
      images: [
        {
          url: socialImage,
          width: 1680,
          height: 945,
          alt: "Resilience OS supply-chain decision path from sensing to measured business outcomes",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Resilience OS — Signal to measured value",
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
