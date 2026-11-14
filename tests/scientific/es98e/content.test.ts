import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { es98eChapters, es98eIndexSource, es98eTopics } from "../../../src/lib/es98e";

test("all original substantive questions have chapter destinations with valid anchors", async () => {
    const archive = await readFile("docs/scientific-publishing/modules/es98e/source-viva.md", "utf8");
    const map = await readFile("docs/scientific-publishing/modules/es98e/curriculum-map.md", "utf8");
    const originals = [...archive.matchAll(/^### (\d+) (.+)$/gm)];
    assert.equal(originals.length, 26);
    const chapters = await es98eChapters();
    for (const [, id, question] of originals) {
        assert.ok(map.includes(question), `missing question text Q${id}`);
        const row = map.split("\n").find((line) => new RegExp(`\\| Q${id}\\s*\\|`).test(line));
        assert.ok(row, `missing coverage Q${id}`);
        const links = [...row.matchAll(/\]\(\/notes\/es98e\/([a-z-]+)(?:#([a-z-]+))?\)/g)];
        assert.ok(links.length > 0, `missing destination Q${id}`);
        for (const [, slug, anchor] of links) {
            const chapter = chapters.find((c) => c.slug === slug);
            assert.ok(chapter, `missing chapter ${slug}`);
            if (anchor) assert.ok(chapter.source.includes(`id="${anchor}"`), `missing anchor ${slug}#${anchor}`);
        }
    }
});

test("Part B precedes Part A and chapter links target existing explicit anchors", async () => {
    assert.deepEqual(
        es98eTopics.map((c) => c.part),
        ["B", "B", "B", "A", "A", "A", "A", "A"]
    );
    const chapters = await es98eChapters();
    for (const source of [await es98eIndexSource(), ...chapters.map((c) => c.source)]) {
        for (const [, slug, anchor] of source.matchAll(/\]\(\/notes\/es98e\/([a-z-]+)(?:#([a-z-]+))?\)/g)) {
            const chapter = chapters.find((c) => c.slug === slug);
            assert.ok(chapter, `unknown target ${slug}`);
            if (anchor) assert.ok(chapter.source.includes(`id="${anchor}"`), `unknown target ${slug}#${anchor}`);
        }
    }
    assert.equal(
        chapters.reduce((n, c) => n + (c.source.match(/<svg data-es98e-diagram=/g)?.length ?? 0), 0),
        7
    );
    assert.equal(
        chapters.reduce((n, c) => n + (c.source.match(/<PredictReveal /g)?.length ?? 0), 0),
        2
    );
});
