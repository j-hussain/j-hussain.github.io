"use client";
import { useState } from "react";
import { Figure } from "./core";
import { orthogonalCoordinates } from "./projection-math";
export function ProjectionExplorer() {
    const [degrees, setDegrees] = useState(0);
    const [showSecond, setShowSecond] = useState(false);
    const [calibration, setCalibration] = useState(false);
    const x: readonly [number, number] = calibration ? [2, 3] : [2, 1];
    const { u, v, a, b, projection: p, residual: r, energy } = orthogonalCoordinates(x, degrees);
    const sx = (n: number) => 200 + n * 38;
    const sy = (n: number) => 165 - n * 38;
    const fmt = (n: number) => (Math.abs(n) < 0.0005 ? 0 : n).toFixed(3);
    return (
        <Figure
            id="projection-experiment"
            title="One vector, two changing measurements"
            caption={
                <>
                    Solid ink: fixed vector {calibration ? "y = (2, 3)" : "x = (2, 1)"}. Teal: its first projection.
                    Dashed segment: what that projection misses. Rotate the orthonormal rulers, then reveal the second
                    component. Both axes use the same fixed scale. The calibration preset returns here later in the
                    argument.
                </>
            }
        >
            <svg
                viewBox="0 0 400 340"
                role="img"
                aria-label={`Fixed vector (${x.join(", ")}); first projection (${fmt(p[0])}, ${fmt(p[1])}); perpendicular residual (${fmt(r[0])}, ${fmt(r[1])}).`}
                className="sci-projection-svg"
            >
                <line
                    x1={sx(-3.6 * u[0])}
                    y1={sy(-3.6 * u[1])}
                    x2={sx(3.6 * u[0])}
                    y2={sy(3.6 * u[1])}
                    className="sci-axis"
                />
                <line
                    x1={sx(-3.6 * v[0])}
                    y1={sy(-3.6 * v[1])}
                    x2={sx(3.6 * v[0])}
                    y2={sy(3.6 * v[1])}
                    className="sci-axis"
                />
                <text x={sx(3.8 * u[0])} y={sy(3.8 * u[1])} textAnchor="middle">
                    ψ₁
                </text>
                <text x={sx(3.8 * v[0])} y={sy(3.8 * v[1])} textAnchor="middle">
                    ψ₂
                </text>
                <line x1={sx(0)} y1={sy(0)} x2={sx(x[0])} y2={sy(x[1])} stroke="currentColor" strokeWidth="2" />
                <circle cx={sx(x[0])} cy={sy(x[1])} r="4" fill="currentColor" />
                <text x={sx(x[0]) + 9} y={sy(x[1]) - 8}>
                    {calibration ? "y" : "x"}
                </text>
                <line x1={sx(0)} y1={sy(0)} x2={sx(p[0])} y2={sy(p[1])} className="sci-vector" />
                <circle cx={sx(p[0])} cy={sy(p[1])} r="4" fill="var(--sci-accent)" />
                <line
                    x1={sx(p[0])}
                    y1={sy(p[1])}
                    x2={sx(x[0])}
                    y2={sy(x[1])}
                    stroke="currentColor"
                    strokeDasharray="5 5"
                />
                {showSecond && (
                    <line
                        x1={sx(0)}
                        y1={sy(0)}
                        x2={sx(r[0])}
                        y2={sy(r[1])}
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="5 5"
                    />
                )}
                <text x="185" y="183">
                    0
                </text>
                <path d="M181 305V311M181 308H219M219 305V311" fill="none" stroke="currentColor" />
                <text x="200" y="320" textAnchor="middle">
                    1 unit
                </text>
            </svg>
            <div className="sci-controls sci-sliders">
                <label>
                    Ruler angle: {degrees.toFixed(1)}°
                    <input
                        type="range"
                        aria-label="Ruler angle"
                        min="-180"
                        max="180"
                        step="0.1"
                        value={degrees}
                        onChange={(e) => setDegrees(Number(e.target.value))}
                    />
                </label>
            </div>
            <p role="status">
                First coordinate α₁ = {fmt(a)}.{" "}
                {showSecond
                    ? `Second coordinate α₂ = ${fmt(b)}. Squared lengths: ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(energy)}.`
                    : "What component would complete the vector?"}
            </p>
            <div className="sci-controls">
                <button type="button" aria-expanded={showSecond} onClick={() => setShowSecond(!showSecond)}>
                    {showSecond ? "Hide second component" : "Reveal second component"}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setCalibration(true);
                        setDegrees((Math.atan2(2, 1) * 180) / Math.PI);
                        setShowSecond(true);
                    }}
                >
                    Calibration preset
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setDegrees(0);
                        setShowSecond(false);
                        setCalibration(false);
                    }}
                >
                    Reset rulers
                </button>
            </div>
            {showSecond && (
                <p>
                    The two perpendicular components add to ({x.join(", ")}). Their squared lengths add to{" "}
                    {energy.toFixed(0)}, the original squared length.{" "}
                    {calibration &&
                        `The first projection is (${fmt(p[0])}, ${fmt(p[1])}); the residual is (${fmt(r[0])}, ${fmt(r[1])}).`}
                </p>
            )}
            <noscript>
                <p>
                    At the initial angle, the coordinates are 2 and 1. Their squared lengths sum to 5. Rotating the
                    rulers changes the coordinates but preserves this sum.
                </p>
            </noscript>
        </Figure>
    );
}
