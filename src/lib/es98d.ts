import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/** Explicit course order and allowlist: route input never selects a filesystem path. */
export const es98dTopics = [
    "equilibrium",
    "interaction-models",
    "dynamics",
    "monte-carlo",
    "uncertainty-observables",
    "collective-updates",
    "event-chains",
    "continuum-particles",
    "free-energy",
] as const;

export async function es98dChapters() {
    return Promise.all(
        es98dTopics.map(async (topic) => {
            const source = await readFile(path.join(process.cwd(), "_notes/es98d", `${topic}.md`), "utf8");
            return { topic, title: String(matter(source).data.title), source };
        })
    );
}
