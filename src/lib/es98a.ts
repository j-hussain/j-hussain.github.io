import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
export async function es98aWeeks() {
    return Promise.all(
        Array.from({ length: 10 }, async (_, i) => {
            const week = `week${i + 1}`;
            const source = await readFile(path.join(process.cwd(), "_notes/es98a", `${week}.md`), "utf8");
            return { week, title: String(matter(source).data.title), source };
        })
    );
}
