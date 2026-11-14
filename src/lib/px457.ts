import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/** Source-index order, not invented weekly labels. Only these files may be read. */
export const px457Order = [
    "intro-hpc",
    "intro-optimisation",
    "memory-architecture",
    "openmp-parallels-work-sharing",
    "openmp-variables-synchronisation",
    "openmp-loop-scheduling",
    "openmp-dependencies",
    "mpi-intro",
    "mpi-point-to-point",
    "mpi-collective",
    "mpi-communicators",
    "mpi-advanced",
    "metrics",
    "cuda",
    "higher-abstractions",
] as const;

export async function px457Chapter(slug: string) {
    const index = px457Order.findIndex((entry) => entry === slug);
    if (index < 0) return null;
    const source = await readFile(path.join(process.cwd(), "_notes/px457", `${px457Order[index]}.md`), "utf8");
    return {
        slug: px457Order[index],
        title: String(matter(source).data.title),
        source,
        previous: px457Order[index - 1],
        next: px457Order[index + 1],
    };
}
