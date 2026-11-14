import Link from "next/link";
import TopNav from "../../components/top-nav";
import MobileNav from "../../components/mobile-nav";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { scientificMDX } from "../../../lib/scientific-mdx";
import styles from "./contents.module.css";
import "../../../components/scientific/article.css";
export const metadata = { title: "ES98A: Fundamentals of Predictive Modelling" };
export default async function Module() {
    const article = await scientificMDX(await readFile(path.join(process.cwd(), "_notes/es98a.md"), "utf8"));
    return (
        <>
            <div className="sci-navigation">
                <TopNav />
            </div>
            <MobileNav />
            <main className="scientific-article">
                <Link href="/notes">Notes</Link>
                <h1>{article.title}</h1>
                <article className={`${styles.contents} sci-week-list`}>{article.content}</article>
            </main>
        </>
    );
}
