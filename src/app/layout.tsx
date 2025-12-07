import type { Metadata } from "next";
import { Rethink_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Kan I Just Ban Already - Collaborative Kanban Boards",
  description:
    "Frictionless collaborative Kanban boards. No accounts needed for team members—just a link and a password.",
  keywords: [
    "kanban",
    "board",
    "collaboration",
    "project management",
    "task management",
  ],
  icons: {
    icon: "https://fav.farm/📋",
  },
  openGraph: {
    title: "Kan I Just Ban Already",
    description:
      "Frictionless collaborative Kanban boards. No accounts needed for team members.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kan I Just Ban Already",
    description:
      "Frictionless collaborative Kanban boards for quick brainstorming.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rethinkSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
