import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { renderES98A } from "../../../../components/scientific/modules/es98a/render";
import "katex/dist/katex.min.css";
import "../../../../components/scientific/article.css";
export const metadata = { title: "ES98A animation gallery", robots: { index: false, follow: false } };
export default async function AnimationGallery() {
    if (process.env.NODE_ENV !== "development") notFound();
    const article = await renderES98A(
        await readFile("docs/scientific-publishing/modules/es98a/animation-gallery.mdx", "utf8")
    );
    return (
        <main className="scientific-article">
            <h1>{article.title}</h1>
            <article>{article.content}</article>
        </main>
    );
}
