import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/** Explicit order: Part B (lectures 1–4) precedes Part A (lectures 5–8). */
export const es98eTopics = [
    { slug: "sensitivity", part: "B" },
    { slug: "regression", part: "B" },
    { slug: "gaussian-processes", part: "B" },
    { slug: "neural-learning", part: "A" },
    { slug: "symmetry-graphs", part: "A" },
    { slug: "differential-equations", part: "A" },
    { slug: "latent-geometry", part: "A" },
    { slug: "variational-inference", part: "A" },
] as const;

export async function es98eChapters() {
    return Promise.all(
        es98eTopics.map(async (topic) => {
            const source = await readFile(path.join(process.cwd(), "_notes/es98e", `${topic.slug}.md`), "utf8");
            return { ...topic, title: String(matter(source).data.title), source };
        })
    );
}

export function es98eIndexSource() {
    return readFile(path.join(process.cwd(), "_notes/es98e.md"), "utf8");
}
