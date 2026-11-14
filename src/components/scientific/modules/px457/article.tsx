import { cloneElement, isValidElement } from "react";
import { scientificMDX } from "../../../../lib/scientific-mdx";
import { PX457Animation } from "./animations";

/** Keep the reviewed compiler and its map; register only the module's own island.
 * next-mdx-remote returns <Content components={map}/>. Assert that contract so
 * dependency changes cannot silently drop existing scientific components.
 */
export async function px457MDX(source: string) {
    const article = await scientificMDX(source);
    if (!isValidElement<{ components: Record<string, unknown> }>(article.content) || !article.content.props.components)
        throw new Error("PX457 requires the reviewed MDX component-map contract");
    return {
        ...article,
        content: cloneElement(article.content, { components: { ...article.content.props.components, PX457Animation } }),
    };
}
