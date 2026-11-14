"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Figure } from "../../core";
import { animationCatalogue, type AnimationKind } from "./animation-catalogue";
import { animationScene, type Shape } from "./animation-scenes";
import styles from "./animations.module.css";

// Snapshot hooks keep server HTML deterministic while reading browser-only preferences.
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
const reducedSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function subscribeReduced(changed: () => void) {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
}
// Trigonometric implementations can differ in their last bits across JS engines.
// Render stable, sub-pixel precision instead of engine-dependent float strings.
const coordinate = (value: number) => Number(value.toFixed(3));

function inViewport(element: HTMLElement | null) {
    const bounds = element?.getBoundingClientRect();
    return !!bounds && bounds.bottom >= -120 && bounds.top <= window.innerHeight + 120;
}

function Mark({ shape, prefix }: { shape: Shape; prefix: string }) {
    const common = {
        className: styles[shape.role],
        opacity: coordinate(shape.opacity ?? 1),
        clipPath: shape.clip ? `url(#${prefix}-${shape.clip})` : undefined,
    };
    switch (shape.type) {
        case "path":
            return (
                <path
                    {...common}
                    d={
                        shape.points.map(([x, y], i) => `${i ? "L" : "M"}${coordinate(x)} ${coordinate(y)}`).join(" ") +
                        (shape.closed ? " Z" : "")
                    }
                    fill={shape.fill ? "currentColor" : "none"}
                    stroke={shape.fill ? "none" : "currentColor"}
                    strokeWidth={shape.width ?? 1.7}
                    strokeDasharray={shape.dash === "dotted" ? "1 5" : shape.dash ? "5 5" : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            );
        case "circle":
            return (
                <circle
                    {...common}
                    cx={coordinate(shape.x)}
                    cy={coordinate(shape.y)}
                    r={coordinate(shape.r)}
                    fill={shape.fill ? "currentColor" : "var(--background-color)"}
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
            );
        case "rect":
            return (
                <rect
                    {...common}
                    x={coordinate(shape.x)}
                    y={coordinate(shape.y)}
                    width={coordinate(shape.width)}
                    height={coordinate(shape.height)}
                    fill="currentColor"
                />
            );
        case "text":
            return (
                <text
                    {...common}
                    x={coordinate(shape.x)}
                    y={coordinate(shape.y)}
                    textAnchor={shape.anchor ?? "start"}
                    fontSize={shape.size ?? 16}
                    fill="currentColor"
                >
                    {shape.text}
                </text>
            );
    }
}

export function ES98EAnimation({ kind }: { kind: AnimationKind }) {
    const metadata = animationCatalogue[kind];
    const rawId = useId(),
        identifier = `es98e-motion-${kind}`,
        prefix = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
    const [progress, setProgress] = useState(0),
        [parameter, setParameter] = useState<number>(metadata.initial);
    const [playing, setPlaying] = useState(false);
    const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
    const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, serverReady);
    const progressRef = useRef(0),
        container = useRef<HTMLDivElement>(null);
    const model = useMemo(() => animationScene(kind, progress, parameter), [kind, progress, parameter]);
    function seek(value: number) {
        setPlaying(false);
        progressRef.current = value;
        setProgress(value);
    }
    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const changed = () => {
            setPlaying(false);
        };
        media.addEventListener("change", changed);
        const visibility = () => {
            if (document.hidden) setPlaying(false);
        };
        document.addEventListener("visibilitychange", visibility);
        const otherStarted = (event: Event) => {
            if ((event as CustomEvent<string>).detail !== rawId) setPlaying(false);
        };
        window.addEventListener("es98e-animation-play", otherStarted);
        return () => {
            media.removeEventListener("change", changed);
            document.removeEventListener("visibilitychange", visibility);
            window.removeEventListener("es98e-animation-play", otherStarted);
        };
    }, [rawId]);
    useEffect(() => {
        if (!playing || reduced) return;
        const from = progressRef.current,
            started = performance.now(),
            duration = 14000 * (1 - from);
        let request = 0,
            lastDraw = 0;
        const frame = (now: number) => {
            if (document.hidden) {
                setPlaying(false);
                return;
            }
            const fraction = Math.min(1, (now - started) / Math.max(duration, 1));
            if (now - lastDraw >= 1000 / 30 || fraction === 1) {
                // Read the fixed outer box before updating the SVG. This avoids stale
                // queued observer entries during rapid scrolling or first interaction.
                if (!inViewport(container.current)) {
                    setPlaying(false);
                    return;
                }
                const eased = (1 - Math.cos(Math.PI * fraction)) / 2,
                    value = from + (1 - from) * eased;
                progressRef.current = value;
                setProgress(value);
                lastDraw = now;
            }
            if (fraction < 1) request = requestAnimationFrame(frame);
            else setPlaying(false);
        };
        request = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(request);
    }, [playing, reduced]);
    function play() {
        if (reduced) {
            seek(Math.min(1, progressRef.current + 0.1));
            return;
        }
        if (playing) {
            setPlaying(false);
            return;
        }
        if (progressRef.current >= 1) {
            progressRef.current = 0;
            setProgress(0);
        }
        window.dispatchEvent(new CustomEvent("es98e-animation-play", { detail: rawId }));
        setPlaying(true);
    }
    const controls = (
        <div className={styles.controls}>
            <div className={styles.transport}>
                <button
                    type="button"
                    className={styles.play}
                    onClick={play}
                    disabled={!ready || (reduced && progress >= 1)}
                    aria-label={`${reduced ? "Step forward" : playing ? "Pause" : "Play"}: ${metadata.title}`}
                >
                    <span aria-hidden="true">{reduced ? "→" : playing ? "Ⅱ" : "▷"}</span>{" "}
                    {reduced ? "Step forward" : playing ? "Pause" : "Play"}
                </button>
                <button
                    type="button"
                    onClick={() => seek(0)}
                    disabled={!ready}
                    aria-label={`Replay: ${metadata.title}`}
                >
                    ↺ Replay
                </button>
                <span className={styles.progress} aria-hidden="true">
                    {Math.round(progress * 100)}%
                </span>
            </div>
            <label className={styles.slider} htmlFor={`${prefix}-timeline`}>
                <span>{metadata.timeline}</span>
                <input
                    id={`${prefix}-timeline`}
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={progress}
                    onChange={(event) => seek(Number(event.target.value))}
                    disabled={!ready}
                />
            </label>
            {kind === "message-waves" ? (
                <button
                    type="button"
                    aria-pressed={parameter === 1}
                    disabled={!ready}
                    onClick={() => {
                        setPlaying(false);
                        setParameter(parameter === 1 ? 0 : 1);
                    }}
                >
                    Reverse node order
                </button>
            ) : (
                <label className={styles.slider} htmlFor={`${prefix}-parameter`}>
                    <span>
                        {metadata.parameter} <output>{Number(parameter.toFixed(2))}</output>
                    </span>
                    <input
                        id={`${prefix}-parameter`}
                        type="range"
                        min={metadata.min}
                        max={metadata.max}
                        step={metadata.step}
                        value={parameter}
                        onChange={(event) => {
                            setPlaying(false);
                            setParameter(Number(event.target.value));
                        }}
                        disabled={!ready}
                    />
                </label>
            )}
            {reduced && (
                <p className={styles.motionNote}>
                    Reduced motion: playback advances one step at a time. You can also scrub the timeline.
                </p>
            )}
        </div>
    );
    return (
        <div
            ref={container}
            className={styles.experiment}
            data-es98e-animation-kind={kind}
            data-progress={progress.toFixed(4)}
            data-playing={playing}
        >
            <Figure
                id={identifier}
                title={metadata.title}
                caption={
                    <>
                        {metadata.caption}
                        <noscript>
                            <p>
                                The initial illustration and its mathematical explanation remain visible. Playback and
                                parameter controls require JavaScript.
                            </p>
                        </noscript>
                    </>
                }
                controls={controls}
            >
                <p className={styles.equation}>{metadata.formula}</p>
                <svg className={styles.scene} viewBox={`0 0 480 ${model.height}`} role="img" aria-label={model.summary}>
                    <defs>
                        {model.clips.map((clip) => (
                            <clipPath key={clip.id} id={`${prefix}-${clip.id}`}>
                                <rect x={clip.x} y={clip.y} width={clip.width} height={clip.height} />
                            </clipPath>
                        ))}
                    </defs>
                    {model.shapes.map((shape, index) => (
                        <Mark key={index} shape={shape} prefix={prefix} />
                    ))}
                </svg>
                <p className={styles.readout} aria-live={playing ? "off" : "polite"} aria-atomic="true">
                    {model.metrics.map((value) => (
                        <span key={value.split("=")[0]}>{value}</span>
                    ))}
                </p>
            </Figure>
        </div>
    );
}
