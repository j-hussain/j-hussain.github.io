import { compileMDX } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import matter from "gray-matter";
import * as components from "../components/scientific";

/** Only compile reviewed, repository-owned content. MDX is executable code. */
export async function scientificMDX(source: string) {
    const { data, content } = matter(source);
    const result = await compileMDX({
        // Legacy notes put display delimiters on the same line. Remark requires
        // separate lines for display math; preserve the expression verbatim.
        source: content.replace(/^\$\$(.+)\$\$\s*$/gm, (_, math: string) => `$$\n${math}\n$$`),
        components,
        options: {
            // All content is repository-owned; allow structured component props.
            // Never pass user submissions or remote content into this compiler.
            blockJS: false,
            mdxOptions: {
                remarkPlugins: [remarkMath, remarkGfm],
                rehypePlugins: [
                    [
                        rehypeKatex,
                        { trust: (context: { command: string }) => context.command === "\\htmlClass", strict: "warn" },
                    ],
                ],
            },
        },
    });
    return { title: String(data.title || "Scientific article"), content: result.content };
}
