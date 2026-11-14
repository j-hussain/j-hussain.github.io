import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import { PostHogInitializer } from "../context-providers/posthog-initializer";

const fontGeistSans = localFont({
    src: [
        { path: "./fonts/geist-sans-latin-400-normal.woff2", weight: "400" },
        { path: "./fonts/geist-sans-latin-500-normal.woff2", weight: "500" },
    ],
    variable: "--font-geist-sans",
});

const fontGeistMono = localFont({
    src: "./fonts/geist-mono-latin-400-normal.woff2",
    variable: "--font-geist-mono",
});

export const metadata: Metadata = {
    // Share images need absolute URLs, so relative ones resolve against the live site.
    metadataBase: new URL("https://jabir.dev"),
    title: "Jabir Hussain",
    description: "Independent researcher and builder, threading the needle of AI and societal co-evolution.",
    twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        // next-themes sets the theme class on <html> before React hydrates, which React would otherwise flag.
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${fontGeistMono.variable} ${fontGeistSans.variable} scroll-smooth overflow-x-clip bg-background text-foreground`}
                style={
                    {
                        "--font-inter": "Arial, sans-serif",
                        "--font-playfair-display": "Georgia, serif",
                    } as React.CSSProperties
                }
            >
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="theme">
                    <PostHogInitializer>{children}</PostHogInitializer>
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
}
