import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { px457MDX } from "../../../src/components/scientific/modules/px457/article";
import { scientificMDX } from "../../../src/lib/scientific-mdx";

async function main() {
    const root = process.cwd();
    const index = await readFile(path.join(root, "_notes/px457.md"), "utf8");
    const slugs = [...index.matchAll(/\]\(\/notes\/px457\/([a-z0-9-]+)\)/g)].map((m) => m[1]);
    if (slugs.length !== 15 || new Set(slugs).size !== 15)
        throw new Error("Expected 15 unique chapters in course order");
    const out = path.join(root, "artifacts/px457/preview");
    await mkdir(out, { recursive: true });
    const moduleCSS = await readFile(path.join(root, "src/components/scientific/modules/px457/article.css"), "utf8");
    const articleCSS = await readFile(path.join(root, "src/components/scientific/article.css"), "utf8");
    const katexCSS = await readFile(path.join(root, "node_modules/katex/dist/katex.min.css"), "utf8");
    const baseCSS = `*{box-sizing:border-box}body{margin:0;background:#faf9f6;color:#252525;font-family:Arial,sans-serif}body.dark{background:#171715;color:#e8e6df}a{color:inherit}svg{max-width:100%}pre{overflow-x:auto}button{font:inherit}h1{font-size:2rem}`;
    const pages: Record<string, string> = {};
    for (const slug of ["index", ...slugs]) {
        const source = slug === "index" ? index : await readFile(path.join(root, "_notes/px457", `${slug}.md`), "utf8");
        const compiled = await (slug === "index" ? scientificMDX(source) : px457MDX(source));
        const content = renderToStaticMarkup(
            <main className={`scientific-article px457-article${slug === "index" ? " px457-contents" : ""}`}>
                <h1>{compiled.title}</h1>
                <article>{compiled.content}</article>
            </main>
        );
        const expectedAnimations = slug === "index" ? 0 : 2;
        if ([...content.matchAll(/data-scene="/g)].length !== expectedAnimations)
            throw new Error(`${slug}: expected ${expectedAnimations} animations`);
        if (content.includes("katex-error")) throw new Error(`${slug}: KaTeX error`);
        const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
        if (new Set(ids).size !== ids.length) throw new Error(`${slug}: duplicate ids`);
        const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${compiled.title}</title><style>${baseCSS}\n${articleCSS}\n${moduleCSS}\n${katexCSS}</style></head><body>${content}</body></html>`;
        pages[slug] = html;
        await writeFile(path.join(out, `${slug}.html`), html);
        console.log(`compiled ${slug}: ${source.split(/\s+/).length} source tokens; ${ids.length} IDs`);
    }
    for (const [slug, html] of Object.entries(pages)) {
        for (const match of html.matchAll(/href="(\/notes\/px457(?:\/[a-z0-9-]+)?)(?:#([^"]+))?"/g)) {
            const dest = match[1].split("/")[3] || "index";
            if (!pages[dest]) throw new Error(`${slug}: missing destination ${dest}`);
            if (match[2] && !pages[dest].includes(`id="${match[2]}"`))
                throw new Error(`${slug}: missing anchor ${dest}#${match[2]}`);
        }
        for (const match of html.matchAll(/href="#([^"]+)"/g)) {
            if (!html.includes(`id="${match[1]}"`)) throw new Error(`${slug}: missing local anchor ${match[1]}`);
        }
    }
    const gallery = await px457MDX(
        await readFile("docs/scientific-publishing/modules/px457/animations-gallery.mdx", "utf8")
    );
    const galleryHTML = renderToStaticMarkup(gallery.content);
    if ([...galleryHTML.matchAll(/data-scene="/g)].length !== 30) throw new Error("Animation gallery incomplete");
    await writeFile(path.join(out, "animation-gallery.html"), galleryHTML);
    console.log("All 16 PX457 sources and 30 gallery examples compile; internal targets exist.");
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
