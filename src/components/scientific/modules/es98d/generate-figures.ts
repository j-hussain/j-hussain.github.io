import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { format, resolveConfig } from "prettier";
import { es98dFigureSources } from "./figures";

// Only module-owned files. Check mode is a reproducibility assertion, not an edit.
const check = process.argv.includes("--check");
async function main() {
    for (const [name, { chapter, mdx }] of Object.entries(es98dFigureSources())) {
        const file = path.join(process.cwd(), "_notes/es98d", `${chapter}.md`);
        const source = await readFile(file, "utf8");
        const current = source.match(/<Figure\b[\s\S]*?<\/Figure>/)?.[0];
        if (!current || !current.includes(`id="es98d-${name}"`)) throw new Error(`Missing figure in ${file}`);
        const expected = await format(source.replace(current, mdx), { ...(await resolveConfig(file)), filepath: file });
        if (check && source !== expected) throw new Error(`Regenerate ${name}`);
        if (!check) await writeFile(file, expected);
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
