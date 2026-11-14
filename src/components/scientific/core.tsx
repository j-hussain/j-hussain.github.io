import type { ReactNode } from "react";

export function Figure({
    id,
    title,
    caption,
    children,
    controls,
    size = "normal",
}: {
    id: string;
    title?: string;
    caption: ReactNode;
    children: ReactNode;
    controls?: ReactNode;
    size?: "normal" | "wide" | "breakout";
}) {
    return (
        <figure id={id} className={`sci-figure sci-${size}`} aria-labelledby={`${id}-caption`}>
            {title && <div className="sci-figure-title">{title}</div>}
            {children}
            {controls && <div className="sci-controls">{controls}</div>}
            <figcaption id={`${id}-caption`}>
                {caption}{" "}
                <a href={`#${id}`} aria-label={`Link to ${title || id}`}>
                    ↗
                </a>
            </figcaption>
        </figure>
    );
}

export function Sidenote({ children }: { children: ReactNode }) {
    return (
        <aside className="sci-sidenote" aria-label="Sidenote">
            {children}
        </aside>
    );
}
