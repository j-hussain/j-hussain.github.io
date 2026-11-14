import { Fragment } from "react";
import matter from "gray-matter";
import { scientificMDX } from "../../../../lib/scientific-mdx";
import { isAnimationKind } from "./animation-catalogue";
import { ES98EAnimation } from "./animations";

/** Module composition only: prose always uses the unchanged scientific MDX pipeline.
 * Slots must be standalone, top-level native divs between complete MDX blocks.
 */
export async function es98eArticle(source: string) {
    const { data, content } = matter(source);
    const slots = content.split(/^<div data-es98e-animation="([a-z-]+)" \/>\s*$/gm);
    const fragments = await Promise.all(
        slots.map(async (block, index) => {
            if (index % 2) {
                if (!isAnimationKind(block)) throw new Error(`Unknown ES98E animation: ${block}`);
                return <ES98EAnimation key={`animation-${block}`} kind={block} />;
            }
            if (block.includes("data-es98e-animation")) throw new Error("Malformed ES98E animation slot");
            return <Fragment key={`prose-${index}`}>{(await scientificMDX(block)).content}</Fragment>;
        })
    );
    return { title: String(data.title || "ES98E: Scientific Machine Learning"), content: <>{fragments}</> };
}
