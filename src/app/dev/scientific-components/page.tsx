import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { scientificMDX } from "../../../lib/scientific-mdx";
import "katex/dist/katex.min.css";
import "../../../components/scientific/article.css";

export const metadata = { robots: { index: false, follow: false } };
export default async function Gallery() {
    if (process.env.NODE_ENV !== "development") notFound();
    const article = await scientificMDX(
        await readFile(path.join(process.cwd(), "docs/scientific-publishing/examples/gallery.mdx"), "utf8")
    );
    return (
        <main className="scientific-article">
            <h1>{article.title}</h1>
            {article.content}
        </main>
    );
}
