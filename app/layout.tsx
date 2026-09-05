import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "tanjx is a supply chain workspace connecting network intelligence, client projects, specialist applications, operations research, agents, collaboration, and traceable evidence.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "tanjx-supply-chain-workspace.chatgpt.site";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const socialImage = `${protocol}://${host}/og-workspace.png`;

  return {
    title: "tanjx — Supply Chain Workspace",
    description,
    applicationName: "tanjx",
    category: "Supply-network workspace",
    robots: { index: false, follow: false },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      title: "tanjx — Supply Chain Workspace",
      description,
      images: [
        {
          url: socialImage,
          width: 1731,
          height: 909,
          alt: "tanjx workspace for supply-network operations and client projects",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "tanjx — Supply Chain Workspace",
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
        className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
