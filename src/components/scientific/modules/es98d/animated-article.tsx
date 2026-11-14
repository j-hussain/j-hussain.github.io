import { Fragment } from "react";
import { scientificMDX } from "../../../../lib/scientific-mdx";
import { motionPlacements } from "./animation-catalog";
import { ES98DAnimation } from "./animations";

/** Compose existing trusted MDX sections with directly imported module client islands. */
export async function animatedES98DArticle(topic: string, source: string) {
    const placements = (motionPlacements[topic] || [])
        .map((placement) => {
            const at = source.indexOf(`<h2 id="${placement.before}">`);
            if (at < 0) throw new Error(`Missing ES98D animation insertion anchor ${placement.before}`);
            return { ...placement, at };
        })
        .sort((a, b) => a.at - b.at);
    let start = 0;
    const sections: { source: string; animation: (typeof placements)[number] | undefined }[] = [];
    for (const placement of placements) {
        sections.push({ source: source.slice(start, placement.at), animation: placement });
        start = placement.at;
    }
    sections.push({ source: source.slice(start), animation: undefined });
    const compiled = await Promise.all(sections.map((section) => scientificMDX(section.source)));
    return {
        title: compiled[0].title,
        content: sections.map((section, i) => (
            <Fragment key={i}>
                {compiled[i].content}
                {section.animation && <ES98DAnimation key={section.animation.kind} kind={section.animation.kind} />}
            </Fragment>
        )),
    };
}
