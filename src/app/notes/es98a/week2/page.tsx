import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import TopNav from "../../../components/top-nav";
import MobileNav from "../../../components/mobile-nav";
import { renderES98A } from "../../../../components/scientific/modules/es98a/render";
import "katex/dist/katex.min.css";
import "../../../../components/scientific/article.css";

export const metadata = {
    title: "ES98A Week 2 · Jabir Hussain",
    description:
        "SVD, least squares and finite-dimensional probability, with an interactive exploration of inverse sensitivity.",
};
export default async function WeekTwo() {
    const article = await renderES98A(await readFile(path.join(process.cwd(), "_notes/es98a/week2.md"), "utf8"));
    return (
        <>
            <div className="sci-navigation">
                <TopNav />
            </div>
            <MobileNav />
            <main className="scientific-article">
                <header>
                    <Link href="/notes/es98a">ES98A · Course contents</Link>
                    <p>ES98A · Week 2</p>
                    <h1>{article.title}</h1>
                </header>
                <article>{article.content}</article>
            </main>
        </>
    );
}
