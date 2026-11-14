import Link from "next/link";
import { notFound } from "next/navigation";
import { es98dChapters, es98dTopics } from "../../../../lib/es98d";
import { animatedES98DArticle } from "../../../../components/scientific/modules/es98d/animated-article";

export const dynamicParams = false;
export function generateStaticParams() {
    return es98dTopics.map((topic) => ({ topic }));
}
export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
    const { topic } = await params;
    const chapter = (await es98dChapters()).find((entry) => entry.topic === topic);
    return { title: chapter ? `${chapter.title} · ES98D` : "Chapter not found" };
}
export default async function ES98DChapter({ params }: { params: Promise<{ topic: string }> }) {
    const { topic } = await params;
    const chapters = await es98dChapters();
    const index = chapters.findIndex((chapter) => chapter.topic === topic);
    if (index < 0) notFound();
    const chapter = chapters[index];
    const article = await animatedES98DArticle(topic, chapter.source);
    return (
        <>
            <header>
                <Link href="/notes/es98d">ES98D · Course contents</Link>
                <h1>{article.title}</h1>
            </header>
            <article>{article.content}</article>
            <nav aria-label="Chapters" className="sci-controls">
                {index > 0 && (
                    <Link href={`/notes/es98d/${chapters[index - 1].topic}`}>← {chapters[index - 1].title}</Link>
                )}
                {index + 1 < chapters.length && (
                    <Link href={`/notes/es98d/${chapters[index + 1].topic}`}>{chapters[index + 1].title} →</Link>
                )}
            </nav>
        </>
    );
}
