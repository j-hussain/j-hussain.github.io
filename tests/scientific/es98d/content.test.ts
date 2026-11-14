import test from "node:test";
import assert from "node:assert/strict";
import { format, resolveConfig } from "prettier";
import { readFile } from "node:fs/promises";
import { es98dChapters, es98dTopics } from "../../../src/lib/es98d";
import { es98dFigureSources } from "../../../src/components/scientific/modules/es98d/figures";

test("all nine allowlisted chapters have titles and explicit reference and figure anchors", async () => {
    const chapters = await es98dChapters();
    assert.equal(chapters.length, 9);
    for (const { source, topic, title } of chapters) {
        assert.ok(title && title !== "undefined", topic);
        assert.ok(source.includes('<h2 id="'), topic);
        assert.ok(/<Figure\s+id="es98d-/.test(source), topic);
    }
});

test("generated figures match their numerical source after canonical formatting", async () => {
    for (const [name, { chapter, mdx }] of Object.entries(es98dFigureSources())) {
        const source = await readFile(`_notes/es98d/${chapter}.md`, "utf8");
        const current = source.match(/<Figure\b[\s\S]*?<\/Figure>/)?.[0];
        assert.ok(current);
        assert.ok(current.includes(`id="es98d-${name}"`));
        const options = { ...(await resolveConfig(`_notes/es98d/${chapter}.md`)), parser: "mdx" };
        assert.equal(await format(current, options), await format(mdx, options));
    }
});

test("every internal ES98D link resolves to an allowlisted chapter and existing explicit anchor", async () => {
    const chapters = await es98dChapters();
    const sourceByTopic = new Map(chapters.map((c) => [c.topic, c.source]));
    const sources = [...chapters.map((c) => c.source), await readFile("_notes/es98d.md", "utf8")];
    for (const source of sources)
        for (const match of source.matchAll(/\]\(\/notes\/es98d\/([^\s)#]+)(?:#([^\s)]+))?\)/g)) {
            const target = sourceByTopic.get(match[1] as (typeof es98dTopics)[number]);
            assert.ok(target, match[0]);
            if (match[2]) assert.ok(target.includes(`id="${match[2]}"`), match[0]);
        }
});

test("coverage map accounts for each of the 18 original questions and the snapshot preserves the original error", async () => {
    const source = await readFile("docs/scientific-publishing/modules/es98d/source-viva.md", "utf8");
    const map = await readFile("docs/scientific-publishing/modules/es98d/curriculum-map.md", "utf8");
    const questions = [...source.matchAll(/^## (\d+) /gm)].map((m) => Number(m[1]));
    assert.deepEqual(
        questions,
        Array.from({ length: 18 }, (_, i) => i + 1)
    );
    for (const n of questions) assert.ok(map.includes(`| Q${n},`), `Missing Q${n}`);
    // Exact original known mathematical error stays in the archive, not in live chapters.
    assert.ok(source.includes("\\sqrt{\\frac{2\\beta}{\\gamma}}"));
    for (const { source: live } of await es98dChapters()) assert.ok(!live.includes("\\sqrt{\\frac{2\\beta}{\\gamma}}"));
});
