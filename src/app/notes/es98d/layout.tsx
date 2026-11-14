import type { ReactNode } from "react";
import TopNav from "../../components/top-nav";
import MobileNav from "../../components/mobile-nav";
import "katex/dist/katex.min.css";
import "../../../components/scientific/article.css";

export default function ES98DLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <div className="sci-navigation">
                <TopNav />
            </div>
            <MobileNav />
            <main className="scientific-article">{children}</main>
        </>
    );
}
