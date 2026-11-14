"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Figure } from "../../core";
import { animationInfo, scene, svgPath, svgPoint, type AnimationKind, type Panel } from "./animation-math";
import styles from "./animations.module.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (callback: () => void) => {
    const query = window.matchMedia(motionQuery);
    query.addEventListener("change", callback);
    return () => query.removeEventListener("change", callback);
};
const reducedSnapshot = () => window.matchMedia(motionQuery).matches;
const serverSnapshot = () => false;
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;

function Plot({ panel }: { panel: Panel }) {
    const uid = useId().replace(/:/g, "");
    const [left, bottom] = svgPoint([panel.x[0], panel.y[0]], panel);
    const [right, top] = svgPoint([panel.x[1], panel.y[1]], panel);
    const ticks = (bounds: [number, number]) => (bounds[0] < 0 && bounds[1] > 0 ? [bounds[0], 0, bounds[1]] : bounds);
    const tickText = (x: number) =>
        Math.abs(x) < 0.00001
            ? "0"
            : Math.abs(x) === Math.PI
              ? x < 0
                  ? "−π"
                  : "π"
              : Number(x.toPrecision(3)).toString();
    return (
        <section className={styles.panel}>
            <h4>{panel.title}</h4>
            <svg
                className={styles.plot}
                viewBox="0 0 380 330"
                role="img"
                aria-label={`${panel.title}. Horizontal: ${panel.xlabel}. Vertical: ${panel.ylabel}.`}
            >
                <defs>
                    <clipPath id={uid}>
                        <rect x={left - 5} y={top - 5} width={right - left + 10} height={bottom - top + 10} />
                    </clipPath>
                </defs>
                <path className={styles.axis} d={`M${left} ${top}V${bottom}H${right}`} />
                {panel.y[0] < 0 && panel.y[1] > 0 && (
                    <path className={styles.zero} d={`M${left} ${svgPoint([0, 0], panel)[1]}H${right}`} />
                )}
                {panel.x[0] < 0 && panel.x[1] > 0 && (
                    <path className={styles.zero} d={`M${svgPoint([0, 0], panel)[0]} ${top}V${bottom}`} />
                )}
                {ticks(panel.x).map((x) => (
                    <text key={x} x={svgPoint([x, 0], panel)[0]} y={bottom + 23} textAnchor="middle">
                        {tickText(x)}
                    </text>
                ))}
                {ticks(panel.y).map((y) => (
                    <text key={y} x={left - 10} y={svgPoint([0, y], panel)[1] + 5} textAnchor="end">
                        {tickText(y)}
                    </text>
                ))}
                <text x={right} y={bottom + 52} textAnchor="end">
                    {panel.xlabel}
                </text>
                <text x={left} y={Math.max(16, top - 14)}>
                    {panel.ylabel}
                </text>
                {panel.labels?.map((label, i) => {
                    const [x, y] = svgPoint(label.at, panel);
                    return (
                        <text key={i} x={x + 6} y={y - 4}>
                            {label.text}
                        </text>
                    );
                })}
                <g clipPath={`url(#${uid})`}>
                    {panel.curves.map((curve, i) => (
                        <path
                            key={i}
                            className={`${styles.curve} ${styles[curve.ink || "accent"]}`}
                            d={svgPath(curve.points, panel)}
                            stroke="currentColor"
                            strokeDasharray={curve.dashed ? "6 5" : undefined}
                            style={{
                                fill: curve.fill ? "currentColor" : "none",
                                opacity: curve.opacity ?? (curve.fill ? 0.15 : 1),
                            }}
                        />
                    ))}
                    {panel.dots?.map((dot, i) => {
                        const [x, y] = svgPoint(dot.at, panel);
                        return (
                            <circle
                                key={i}
                                className={styles[dot.ink || "accent"]}
                                cx={x}
                                cy={y}
                                r={Number((dot.radius ?? 4).toFixed(3))}
                                stroke="currentColor"
                                strokeWidth="1.6"
                                fill={dot.hollow ? "var(--background-color)" : "currentColor"}
                            />
                        );
                    })}
                </g>
            </svg>
        </section>
    );
}

/** One finite, learner-controlled explanation. No animation begins automatically. */
export function ES98AAnimation({ kind }: { kind: AnimationKind }) {
    const info = animationInfo[kind];
    const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
    const [position, setPosition] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [announcement, setAnnouncement] = useState("Ready to explore.");
    const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, serverSnapshot);
    const ref = useRef<HTMLDivElement>(null);
    const positionRef = useRef(position);
    const model = scene(kind, position);
    const rangeId = useId();
    useEffect(() => {
        positionRef.current = position;
    }, [position]);
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) setPlaying(false);
            },
            { threshold: 0 }
        );
        observer.observe(element);
        const visibility = () => {
            if (document.hidden) setPlaying(false);
        };
        document.addEventListener("visibilitychange", visibility);
        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", visibility);
        };
    }, []);
    useEffect(() => {
        if (!playing) return;
        let request = 0;
        const start = performance.now();
        const origin = positionRef.current;
        let previousStep = -1;
        const tick = (now: number) => {
            const elapsed = (now - start) / 9000;
            const next = Math.min(1, origin + (reduced ? Math.floor(elapsed * 18) / 18 : elapsed));
            const step = Math.floor(next * 18);
            if (!reduced || step !== previousStep) {
                setPosition(next);
                previousStep = step;
            }
            if (next >= 1) {
                setPlaying(false);
                setAnnouncement("Animation complete. Scrub or restart to explore again.");
            } else request = requestAnimationFrame(tick);
        };
        request = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(request);
    }, [playing, reduced]);
    return (
        <div
            ref={ref}
            className={styles.animation}
            data-es98a-animation={kind}
            data-playing={playing}
            data-position={position.toFixed(4)}
        >
            <Figure id={`es98a-animated-${kind}`} title={info.title} caption={info.caption}>
                <div className={styles.panels}>
                    {model.panels.map((panel, i) => (
                        <Plot key={i} panel={panel} />
                    ))}
                </div>
                <p className={styles.formula} data-animation-formula>
                    {model.formula}
                </p>
                <p className={styles.summary}>{model.summary}</p>
                <div className={styles.transport}>
                    <label htmlFor={rangeId} className={styles.scrubber}>
                        <span>{info.parameter}</span>
                        <span className={styles.percentage} aria-hidden="true">
                            {Math.round(position * 100)}%
                        </span>
                        <input
                            id={rangeId}
                            disabled={!hydrated}
                            type="range"
                            min="0"
                            max="1000"
                            step="1"
                            value={Math.round(position * 1000)}
                            aria-valuetext={`${(position * 100).toFixed(1)} percent`}
                            onChange={(event) => {
                                setPlaying(false);
                                setPosition(Number(event.target.value) / 1000);
                                setAnnouncement("Paused for manual exploration.");
                            }}
                        />
                    </label>
                    <button
                        disabled={!hydrated}
                        type="button"
                        aria-pressed={playing}
                        onClick={() => {
                            if (position >= 1) {
                                setPosition(0);
                                positionRef.current = 0;
                            }
                            setPlaying(!playing);
                            setAnnouncement(
                                playing
                                    ? "Paused."
                                    : reduced
                                      ? "Playing as discrete steps for reduced motion."
                                      : "Playing."
                            );
                        }}
                    >
                        {playing ? "Pause animation" : position >= 1 ? "Replay animation" : "Play animation"}
                    </button>
                    <button
                        disabled={!hydrated}
                        type="button"
                        onClick={() => {
                            setPlaying(false);
                            setPosition(0);
                            setAnnouncement("Restarted at the initial state.");
                        }}
                    >
                        Restart
                    </button>
                    <p className={styles.motionNote}>
                        {reduced
                            ? "Reduced motion: playback advances in discrete steps."
                            : "Play once, pause, or scrub to inspect an intermediate state."}
                    </p>
                </div>
                <span className="sr-only" role="status" aria-live="polite">
                    {announcement}
                </span>
                <noscript>
                    <p>
                        The initial mathematical view and explanation remain visible. Enable JavaScript to play or scrub
                        this animation.
                    </p>
                </noscript>
            </Figure>
        </div>
    );
}
