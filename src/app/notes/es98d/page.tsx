import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { scientificMDX } from "../../../lib/scientific-mdx";
import styles from "./contents.module.css";

export const metadata = {
    title: "ES98D: Particle-based Modelling (Statistical Physics)",
    description: "A nine-chapter course in equilibrium measures, particle dynamics, Monte Carlo and free energy.",
};

export default async function ES98D() {
    const article = await scientificMDX(await readFile(path.join(process.cwd(), "_notes/es98d.md"), "utf8"));
    return (
        <>
            <header>
                <Link href="/notes">Notes</Link>
                <h1>{article.title}</h1>
            </header>
            <article className={styles.contents}>{article.content}</article>
        </>
    );
}
