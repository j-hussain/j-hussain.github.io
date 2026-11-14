import type { ReactNode } from "react";
import type { Vec2 } from "./week1-math";

// One fixed scale throughout the vector storyboards: 40 SVG units per unit.
export const sx = (x: number) => 40 + 40 * x;
export const sy = (y: number) => 210 - 40 * y;
export function Plane({ label, children }: { label: string; children: ReactNode }) {
    return (
        <svg className="sci-story-svg" viewBox="0 0 260 250" role="img" aria-label={label}>
            <path className="sci-axis" d="M20 210H240M40 230V20" />
            <path className="sci-axis" d="M80 206V214M36 170H44" />
            <text x="26" y="229">
                0
            </text>
            <text x="76" y="231">
                1
            </text>
            <text x="21" y="175">
                1
            </text>
            {children}
        </svg>
    );
}
export function Vector({
    to,
    from = [0, 0],
    kind = "first",
}: {
    to: Vec2;
    from?: Vec2;
    kind?: "first" | "second" | "ink";
}) {
    const dx = sx(to[0]) - sx(from[0]),
        dy = sy(to[1]) - sy(from[1]);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return (
        <g className={`sci-stroke-${kind}`} fill="none" strokeWidth="2.5">
            <line x1={sx(from[0])} y1={sy(from[1])} x2={sx(to[0])} y2={sy(to[1])} />
            {Math.hypot(dx, dy) > 0.01 && (
                <path d="M-8 -4L0 0L-8 4" transform={`translate(${sx(to[0])} ${sy(to[1])}) rotate(${angle})`} />
            )}
        </g>
    );
}
export function Panel({
    title,
    children,
    explanation,
}: {
    title: string;
    children: ReactNode;
    explanation: ReactNode;
}) {
    return (
        <div className="sci-story-panel">
            <h4>{title}</h4>
            {children}
            <p>{explanation}</p>
        </div>
    );
}
