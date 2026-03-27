import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster as SonnerToaster } from "sonner";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0F172A] text-[#E5E7EB] scrollbar-emerald`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <Toaster />
        <SonnerToaster
          position="top-right"
          theme="dark"
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "group border border-zinc-700/80 bg-zinc-900/92 text-zinc-100 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.45)] rounded-xl",
              title: "text-sm font-semibold text-zinc-100",
              description: "text-xs text-zinc-300",
              actionButton:
                "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 rounded-md",
              cancelButton:
                "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 rounded-md",
              success:
                "border-emerald-500/45 bg-emerald-950/40 text-emerald-100",
              error: "border-red-500/45 bg-red-950/35 text-red-100",
              warning:
                "border-amber-500/45 bg-amber-950/35 text-amber-100",
              info: "border-blue-500/45 bg-blue-950/35 text-blue-100",
            },
          }}
        />
      </body>
    </html>
  );
}
