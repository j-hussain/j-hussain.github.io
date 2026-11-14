"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Figure } from "../../core";
import { buildMotion, motionFrame, MOTION_STEPS, type MotionKind } from "./animation-math";
import { motionCatalog } from "./animation-catalog";
import { AnimationScene, motionReadout } from "./animation-scenes";
import styles from "./animations.module.css";

export function ES98DAnimation({ kind, overview = false }: { kind: MotionKind; overview?: boolean }) {
    const spec = motionCatalog[kind],
        controlId = useId();
    const [parameter, setParameter] = useState(spec.initial);
    const [progress, setProgress] = useState(0.18);
    const [playing, setPlaying] = useState(false);
    const [reduced, setReduced] = useState(false);
    const root = useRef<HTMLElement>(null);
    const progressRef = useRef(0.18);
    const data = useMemo(() => buildMotion(kind, parameter), [kind, parameter]);
    const discrete = [
        "metropolis",
        "importance",
        "memory",
        "ising",
        "cluster",
        "shells",
        "lifting",
        "verlet",
        "hazard",
    ].includes(kind);
    const state = motionFrame(data, progress, discrete);
    const readout = motionReadout(kind, state.metrics);
    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => {
            setReduced(media.matches);
            if (media.matches) setPlaying(false);
        };
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) setPlaying(false);
            },
            { threshold: 0 }
        );
        if (root.current) observer.observe(root.current);
        const onHidden = () => {
            if (document.hidden) setPlaying(false);
        };
        document.addEventListener("visibilitychange", onHidden);
        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", onHidden);
        };
    }, []);
    useEffect(() => {
        if (!playing || reduced) return;
        let raf = 0,
            previous = 0,
            lastDraw = 0;
        const tick = (now: number) => {
            if (!previous) {
                previous = now;
                lastDraw = now;
            }
            if (now - lastDraw >= 1000 / 30) {
                const delta = Math.min(0.1, (now - previous) / 1000) / 18;
                previous = now;
                lastDraw = now;
                progressRef.current = Math.min(1, progressRef.current + delta);
                setProgress(progressRef.current);
                if (progressRef.current >= 1) {
                    setPlaying(false);
                    return;
                }
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [playing, reduced]);
    const pauseAndSeek = (value: number) => {
        setPlaying(false);
        progressRef.current = value;
        setProgress(value);
    };
    return (
        <section
            ref={root}
            className={styles.experiment}
            data-es98d-animation={kind}
            data-playing={playing}
            data-progress={progress.toFixed(4)}
            data-parameter={parameter}
        >
            <p className={styles.question}>{spec.question}</p>
            <Figure id={`es98d-motion-${kind}${overview ? "-overview" : ""}`} title={spec.title} caption={spec.caption}>
                <div className={styles.panels}>
                    <AnimationScene
                        kind={kind}
                        data={data}
                        progress={progress}
                        leftTitle={spec.left}
                        rightTitle={spec.right}
                    />
                </div>
                <p className={styles.equation}>{spec.formula}</p>
                <p className={styles.readout} data-motion-readout>
                    {readout}
                </p>
                <div className={styles.transport}>
                    <button
                        type="button"
                        disabled={reduced}
                        aria-pressed={playing}
                        onClick={() => {
                            if (progress >= 1) {
                                progressRef.current = 0;
                                setProgress(0);
                            }
                            setPlaying(!playing);
                        }}
                    >
                        {playing ? "Pause" : "Play"}
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            pauseAndSeek(Math.min(1, (Math.floor(progress * MOTION_STEPS) + 1) / MOTION_STEPS))
                        }
                        disabled={progress >= 1}
                    >
                        Step forward
                    </button>
                    <button type="button" onClick={() => pauseAndSeek(0)}>
                        Restart
                    </button>
                </div>
                <div className={styles.controls}>
                    <label htmlFor={`${controlId}-time`}>
                        <span className={styles.controlLabel}>
                            <span>Animation position</span>
                            <span className={styles.value}>{Math.round(progress * 100)}%</span>
                        </span>
                        <input
                            className={`${styles.slider} ${styles.timeline}`}
                            id={`${controlId}-time`}
                            aria-label="Animation position"
                            type="range"
                            min="0"
                            max="1"
                            step="0.001"
                            value={progress}
                            onChange={(e) => pauseAndSeek(Number(e.target.value))}
                        />
                    </label>
                    <label htmlFor={`${controlId}-parameter`}>
                        <span className={styles.controlLabel}>
                            <span>{spec.parameter}</span>
                            <span className={styles.value}>{parameter.toFixed(2)}</span>
                        </span>
                        <input
                            className={styles.slider}
                            id={`${controlId}-parameter`}
                            aria-label={spec.parameter}
                            type="range"
                            min={spec.min}
                            max={spec.max}
                            step={spec.step}
                            value={parameter}
                            onChange={(e) => {
                                setPlaying(false);
                                progressRef.current = 0;
                                setProgress(0);
                                setParameter(Number(e.target.value));
                            }}
                        />
                    </label>
                </div>
                <p className={styles.status} role="status" aria-live="polite">
                    {reduced
                        ? "Reduced motion: use Step forward or the position slider to explore still frames."
                        : playing
                          ? "Playing. Pause to inspect a frame or change the parameter."
                          : progress >= 1
                            ? "Sequence complete. Restart or scrub to compare frames."
                            : "Paused. Play the sequence, step through it, or drag the position slider."}
                </p>
                <p className={styles.limit}>{spec.limit}</p>
                <noscript>
                    <p>
                        This mathematical still frame and its readout remain available without JavaScript. Playback and
                        parameter exploration require JavaScript. {spec.limit}
                    </p>
                </noscript>
            </Figure>
        </section>
    );
}
