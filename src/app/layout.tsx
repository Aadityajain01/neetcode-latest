import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeetCode - Competitive Coding Platform",
  description: "Solve DSA problems, practice programming, and climb the leaderboard on NeetCode - a modern competitive coding platform.",
  keywords: ["NeetCode", "DSA", "Algorithms", "Data Structures", "Programming", "Competitive Coding"],
  authors: [{ name: "NeetCode Team" }],
  openGraph: {
    title: "NeetCode",
    description: "Competitive coding platform for mastering algorithms and data structures",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0F172A] text-[#E5E7EB]`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
