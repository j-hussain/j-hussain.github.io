import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { scientificMDX } from "../../../lib/scientific-mdx";
import TopNav from "../../components/top-nav";
import MobileNav from "../../components/mobile-nav";
import "katex/dist/katex.min.css";
import "../../../components/scientific/article.css";

import "../../../components/scientific/modules/px457/article.css";

export const metadata = { title: "PX457: High Performance Computing" };

export default async function PX457() {
    const source = await readFile(path.join(process.cwd(), "_notes/px457.md"), "utf8");
    const article = await scientificMDX(source);
    return (
        <>
            <div className="sci-navigation">
                <TopNav />
            </div>
            <MobileNav />
            <main className="scientific-article px457-article px457-contents">
                <header>
                    <Link href="/notes">Notes</Link>
                    <h1>{article.title}</h1>
                </header>
                <article>{article.content}</article>
            </main>
        </>
    );
}
