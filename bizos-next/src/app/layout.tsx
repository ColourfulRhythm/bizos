import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MessageDock } from "@/components/ui/message-dock";
import { SlideTabs } from "@/components/ui/slide-tabs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BizOS — Your Business Operating System",
  description: "AI-powered business documentation. Get investor-ready plans and operating systems in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
          <SlideTabs />
        </header>
        <main className="pt-16">{children}</main>
        <MessageDock theme="light" enableAnimations />
      </body>
    </html>
  );
}
