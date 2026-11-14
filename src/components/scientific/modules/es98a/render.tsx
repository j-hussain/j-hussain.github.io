import { Fragment, type ReactNode } from "react";
import { scientificMDX } from "../../../../lib/scientific-mdx";
import { ES98AAnimation } from "./animations";
import { animationKinds, type AnimationKind } from "./animation-math";

/** Module-owned composition. The shared trusted-MDX compiler is unchanged. */
export async function renderES98A(source: string) {
    const chunks = source.split(/\n<ES98AAnimation kind="([a-z-]+)" \/>\n/g);
    const pieces: ReactNode[] = [];
    let title = "ES98A";
    for (let i = 0; i < chunks.length; i++) {
        if (i % 2) {
            const kind = chunks[i];
            if (!animationKinds.includes(kind as AnimationKind)) throw new Error(`Unknown ES98A animation: ${kind}`);
            pieces.push(<ES98AAnimation key={`animation-${kind}`} kind={kind as AnimationKind} />);
        } else if (chunks[i].trim()) {
            const compiled = await scientificMDX(chunks[i]);
            if (i === 0) title = compiled.title;
            pieces.push(<Fragment key={`prose-${i}`}>{compiled.content}</Fragment>);
        }
    }
    return { title, content: pieces };
}
