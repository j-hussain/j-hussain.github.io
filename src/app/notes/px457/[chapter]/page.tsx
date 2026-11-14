import Link from "next/link";
import { notFound } from "next/navigation";
import { px457Chapter, px457Order } from "../../../../lib/px457";
import { px457MDX } from "../../../../components/scientific/modules/px457/article";
import TopNav from "../../../components/top-nav";
import MobileNav from "../../../components/mobile-nav";
import "katex/dist/katex.min.css";
import "../../../../components/scientific/article.css";

import "../../../../components/scientific/modules/px457/article.css";

export const dynamicParams = false;
export function generateStaticParams() {
    return px457Order.map((chapter) => ({ chapter }));
}
export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }) {
    const note = await px457Chapter((await params).chapter);
    return { title: note?.title || "Note not found" };
}
export default async function Chapter({ params }: { params: Promise<{ chapter: string }> }) {
    const note = await px457Chapter((await params).chapter);
    if (!note) notFound();
    const article = await px457MDX(note.source);
    return (
        <>
            <div className="sci-navigation">
                <TopNav />
            </div>
            <MobileNav />
            <main className="scientific-article px457-article">
                <header>
                    <Link href="/notes/px457">PX457 · Course contents</Link>
                    <h1>{article.title}</h1>
                </header>
                <article>{article.content}</article>
                <nav aria-label="PX457 chapters" className="sci-controls">
                    {note.previous && <Link href={`/notes/px457/${note.previous}`}>← Previous chapter</Link>}
                    {note.next && <Link href={`/notes/px457/${note.next}`}>Next chapter →</Link>}
                </nav>
            </main>
        </>
    );
}
