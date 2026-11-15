"use client";
import React, { useEffect, useState } from "react";

import MobileNav from "./components/mobile-nav";
import FrontPage from "./components/front-page";
import KoiPond, { type PondStats } from "./components/koi-pond/koi-pond";
import TopNav from "./components/top-nav";
import Container from "./components/container";

export default function Home() {
    const [stats, setStats] = useState<PondStats>({ koi: 0, pellets: 0 });

    // The home page is a single screen: no scrolling and no overscroll bounce. Restored when leaving the page.
    useEffect(() => {
        const root = document.documentElement;
        const previous = { overflow: root.style.overflow, overscroll: root.style.overscrollBehavior };
        root.style.overflow = "hidden";
        root.style.overscrollBehavior = "none";
        return () => {
            root.style.overflow = previous.overflow;
            root.style.overscrollBehavior = previous.overscroll;
        };
    }, []);

    return (
        <div
            id="mainPage"
            className="relative h-[100dvh] w-full overflow-hidden bg-background transition-colors duration-300"
        >
            <KoiPond onStats={setStats} className="absolute inset-0 h-full w-full" />
            <MobileNav />
            <TopNav />
            <main className="relative z-20 flex h-full flex-col">
                <FrontPage stats={stats} />
            </main>
            <footer className="absolute inset-x-0 bottom-3 z-20 font-geistMono text-[11px] leading-4 text-[var(--muted-color)]">
                <Container>
                    <p data-koi-avoid className="inline-block">
                        template by{" "}
                        <a
                            href="https://github.com/Dao-Ho/portfolio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:text-foreground focus-visible:text-foreground"
                        >
                            Dao Ho
                        </a>
                    </p>
                </Container>
            </footer>
        </div>
    );
}
