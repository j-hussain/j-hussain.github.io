"use client";

import MobileNav from "../components/mobile-nav";
import TopNav from "../components/top-nav";
import Link from "next/link";

export default function Notes() {
    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            <MobileNav />
            <TopNav />
            <main className="flex min-h-screen items-center justify-center px-6 font-geistMono">
                <ul className="space-y-6 text-[14px] tracking-[0.02em]">
                    <li>
                        <Link className="ink-link" href="/notes/es98a">
                            ES98A: Fundamentals of Predictive Modelling
                        </Link>
                    </li>
                    <li>
                        <Link className="ink-link" href="/notes/es98d">
                            ES98D: Particle-based Modelling (Statistical Physics)
                        </Link>
                    </li>
                    <li>
                        <Link className="ink-link" href="/notes/es98e">
                            ES98E: Scientific Machine Learning
                        </Link>
                    </li>
                    <li>
                        <Link className="ink-link" href="/notes/px457">
                            PX457: High Performance Computing
                        </Link>
                    </li>
                </ul>
            </main>
        </div>
    );
}
