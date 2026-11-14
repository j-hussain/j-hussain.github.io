import Link from "next/link";
import { notFound } from "next/navigation";
import TopNav from "../../../components/top-nav";
import MobileNav from "../../../components/mobile-nav";
import { es98eChapters, es98eTopics } from "../../../../lib/es98e";
import { es98eArticle } from "../../../../components/scientific/modules/es98e/article";
import styles from "../diagrams.module.css";
import "katex/dist/katex.min.css";
import "../../../../components/scientific/article.css";

export const dynamicParams = false;
export function generateStaticParams() {
    return es98eTopics.map(({ slug }) => ({ topic: slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
    const { topic } = await params;
    const chapter = (await es98eChapters()).find(({ slug }) => slug === topic);
    return { title: chapter?.title || "Note not found" };
}
export default async function Topic({ params }: { params: Promise<{ topic: string }> }) {
    const { topic } = await params;
    const chapters = await es98eChapters();
    const index = chapters.findIndex(({ slug }) => slug === topic);
    const chapter = chapters[index];
    if (!chapter) notFound();
    const article = await es98eArticle(chapter.source);
    const previous = chapters[index - 1],
        next = chapters[index + 1];
    return (
        <>
            <div className="sci-navigation">
                <TopNav />
            </div>
            <MobileNav />
            <main className="scientific-article">
                <header>
                    <Link href="/notes/es98e">ES98E · Course contents</Link>
                    <p>
                        Part {chapter.part} · {chapter.part === "B" ? "Lectures 1–4" : "Lectures 5–8"}
                    </p>
                    <h1>{article.title}</h1>
                </header>
                <article className={styles.content}>{article.content}</article>
                <nav aria-label="Chapters" className="sci-controls">
                    {previous && <Link href={`/notes/es98e/${previous.slug}`}>← {previous.title}</Link>}
                    {next && <Link href={`/notes/es98e/${next.slug}`}>{next.title} →</Link>}
                </nav>
            </main>
        </>
    );
}
