"use client";

import { createElement, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Figure } from "../../core";
import { animationCatalog, isAnimationId } from "./animation-catalog";
import { animationFrame } from "./animation-frames";
import { clamp } from "./animation-math";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(notify: () => void) {
    const m = window.matchMedia(motionQuery);
    m.addEventListener("change", notify);
    return () => m.removeEventListener("change", notify);
}
const motionSnapshot = () => window.matchMedia(motionQuery).matches;
const serverMotion = () => false;

/** One reader-controlled clock; no autoplay, dependencies, or shared component edits. */
export function PX457Animation({ scene }: { scene: string }) {
    if (!isAnimationId(scene)) throw new Error(`Unknown PX457 animation: ${scene}`);
    const spec = animationCatalog[scene];
    const [progress, setProgress] = useState(0),
        [playing, setPlaying] = useState(false),
        [comparison, setComparison] = useState(0);
    const clock = useRef(0),
        root = useRef<HTMLElement>(null);
    const reduced = useSyncExternalStore(subscribeMotion, motionSnapshot, serverMotion);
    const timeline = useId();
    const seek = useCallback((next: number) => {
        clock.current = clamp(next);
        setProgress(clock.current);
    }, []);
    useEffect(() => {
        const element = root.current;
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]?.isIntersecting) setPlaying(false);
            },
            { threshold: 0.02 }
        );
        if (element) observer.observe(element);
        const onVisibility = () => {
            if (document.hidden) setPlaying(false);
        };
        const media = window.matchMedia(motionQuery),
            onMotion = () => {
                if (media.matches) setPlaying(false);
            };
        document.addEventListener("visibilitychange", onVisibility);
        media.addEventListener("change", onMotion);
        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            media.removeEventListener("change", onMotion);
        };
    }, []);
    useEffect(() => {
        if (!playing || reduced) return;
        let previous: number | undefined, request: number;
        const tick = (time: number) => {
            if (previous !== undefined) {
                const next = clamp(clock.current + Math.min(64, time - previous) / (spec.duration * 1000));
                seek(next);
                if (next >= 1) {
                    setPlaying(false);
                    return;
                }
            }
            previous = time;
            request = requestAnimationFrame(tick);
        };
        request = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(request);
    }, [playing, reduced, seek, spec.duration]);
    const frame = animationFrame(scene, progress, comparison);
    function choose(value: number) {
        setPlaying(false);
        setComparison(value);
        seek(0);
    }
    function step() {
        setPlaying(false);
        seek((Math.floor(progress * spec.stages + 1e-7) + 1) / spec.stages);
    }
    return (
        <section
            ref={root}
            className="pxa-experiment"
            aria-label={spec.title}
            data-scene={scene}
            data-progress={progress.toFixed(5)}
            data-comparison={comparison}
            data-playing={playing}
        >
            <Figure
                id={`px457-animation-${scene}`}
                title={spec.title}
                caption={
                    <>
                        {spec.caption}
                        <noscript>
                            <p>
                                {spec.outcome} Animated controls require JavaScript; the initial figure and this outcome
                                remain available.
                            </p>
                        </noscript>
                    </>
                }
            >
                <p className="pxa-prompt">{spec.prompt}</p>
                <div className="pxa-comparison" role="group" aria-label="Compare assumptions">
                    {spec.choices.map((choice, i) => (
                        <button type="button" key={choice} aria-pressed={comparison === i} onClick={() => choose(i)}>
                            {choice}
                        </button>
                    ))}
                </div>
                <div className="pxa-playback">
                    <div className="sci-controls">
                        <button
                            type="button"
                            aria-label={playing ? "Pause animation" : "Play animation"}
                            disabled={reduced}
                            onClick={() => {
                                if (progress === 1) seek(0);
                                setPlaying(!playing);
                            }}
                        >
                            <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>{" "}
                            {playing ? "Pause" : progress === 1 ? "Replay" : "Play"}
                        </button>
                        <button type="button" onClick={step} disabled={progress === 1}>
                            Next step
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setPlaying(false);
                                seek(0);
                            }}
                        >
                            Restart
                        </button>
                    </div>
                    <label htmlFor={timeline} className="pxa-timeline">
                        <span>Time</span>
                        <input
                            id={timeline}
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={progress * 100}
                            aria-label="Animation time"
                            aria-valuetext={`${Math.round(progress * 100)} percent complete`}
                            onChange={(e) => {
                                setPlaying(false);
                                seek(Number(e.target.value) / 100);
                            }}
                        />
                        <span aria-hidden="true">{Math.round(progress * 100)}%</span>
                    </label>
                    <p className="pxa-motion-note">
                        {reduced
                            ? "Reduced motion: use Next step or the timeline."
                            : "Play, pause, or scrub to inspect a moment."}
                    </p>
                </div>
                <svg
                    className="pxa-canvas"
                    viewBox={`0 0 360 ${frame.height}`}
                    role="img"
                    aria-label={`${spec.title}. ${frame.summary}`}
                >
                    {frame.marks.map((mark, i) => createElement(mark.tag, { ...mark.attrs, key: i }, mark.text))}
                </svg>
                <div className="pxa-readout" aria-hidden="true">
                    <p className="pxa-equation">{frame.equation}</p>
                    <p>{frame.summary}</p>
                </div>
                <p className="pxa-announcement" aria-live="polite">
                    {playing
                        ? "Animation playing. Pause to inspect."
                        : `${progress === 1 ? "Completed" : "Paused"}. ${frame.summary}`}
                </p>
            </Figure>
        </section>
    );
}
