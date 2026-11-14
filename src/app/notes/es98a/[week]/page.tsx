import Link from "next/link";
import { notFound } from "next/navigation";
import { es98aWeeks } from "../../../../lib/es98a";
import { renderES98A } from "../../../../components/scientific/modules/es98a/render";
import TopNav from "../../../components/top-nav";
import MobileNav from "../../../components/mobile-nav";
import imageOne from "../../../../../_notes/es98a/image.png";
import imageTwo from "../../../../../_notes/es98a/image-1.png";
import "katex/dist/katex.min.css";
import "../../../../components/scientific/article.css";
export const dynamicParams = false;
export async function generateStaticParams() {
    return (await es98aWeeks()).filter((w) => w.week !== "week2").map(({ week }) => ({ week }));
}
export async function generateMetadata({ params }: { params: Promise<{ week: string }> }) {
    const { week } = await params;
    const note = (await es98aWeeks()).find((w) => w.week === week);
    return { title: note?.title || "Note not found" };
}
export default async function Week({ params }: { params: Promise<{ week: string }> }) {
    const { week } = await params;
    const note = (await es98aWeeks()).find((w) => w.week === week);
    if (!note) notFound();
    const source = note.source
        .replaceAll("](image.png)", `](${imageOne.src})`)
        .replaceAll("](image-1.png)", `](${imageTwo.src})`);
    const article = await renderES98A(source);
    const number = Number(week.slice(4));
    return (
        <>
            <div className="sci-navigation">
                <TopNav />
            </div>
            <MobileNav />
            <main className="scientific-article">
                <header>
                    <Link href="/notes/es98a">ES98A · Course contents</Link>
                    <h1>{article.title}</h1>
                </header>
                <article>{article.content}</article>
                <nav aria-label="Weeks" className="sci-controls">
                    {number > 1 && <Link href={`/notes/es98a/week${number - 1}`}>← Week {number - 1}</Link>}
                    {number < 10 && <Link href={`/notes/es98a/week${number + 1}`}>Week {number + 1} →</Link>}
                </nav>
            </main>
        </>
    );
}
