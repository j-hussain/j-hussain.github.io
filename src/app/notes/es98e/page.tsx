import Link from "next/link";
import TopNav from "../../components/top-nav";
import MobileNav from "../../components/mobile-nav";
import { es98eIndexSource } from "../../../lib/es98e";
import { es98eArticle } from "../../../components/scientific/modules/es98e/article";
import "katex/dist/katex.min.css";
import "../../../components/scientific/article.css";

export const metadata = { title: "ES98E: Scientific Machine Learning" };

export default async function Module() {
    const article = await es98eArticle(await es98eIndexSource());
    return (
        <>
            <div className="sci-navigation">
                <TopNav />
            </div>
            <MobileNav />
            <main className="scientific-article">
                <Link href="/notes">Notes</Link>
                <h1>{article.title}</h1>
                <article>{article.content}</article>
            </main>
        </>
    );
}
