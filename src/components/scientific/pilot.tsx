"use client";

import { useState } from "react";
import { Figure } from "./core";
import { LinkedEquation, LinkedTerm, LinkedMark, PredictReveal, Stepper } from "./interactions";
import { inverseNoise } from "./math";

export function SVDExplanation() {
    return (
        <LinkedEquation>
            <p>Select a factor to follow the same operation in the explanation.</p>
            <div
                className="sci-equation"
                aria-label="A x equals sum over i of sigma i times u i times inner product v i with x"
            >
                Ax = ∑ᵢ <LinkedTerm term="scale">σᵢ</LinkedTerm> <LinkedTerm term="output">uᵢ</LinkedTerm>{" "}
                <LinkedTerm term="coordinate">⟨vᵢ, x⟩</LinkedTerm>
            </div>
            <p>
                <LinkedMark term="coordinate">Project x onto the input direction vᵢ</LinkedMark>,{" "}
                <LinkedMark term="scale">scale that coordinate by σᵢ</LinkedMark>, then{" "}
                <LinkedMark term="output">reconstruct along the output direction uᵢ</LinkedMark>. The sum combines all
                nonzero singular modes.
            </p>
        </LinkedEquation>
    );
}

function NoisePlot({
    vector,
    title,
    extent,
    ellipse,
}: {
    vector: readonly number[];
    title: string;
    extent: number;
    ellipse?: number;
}) {
    const scale = 95 / extent;
    return (
        <svg
            viewBox="0 0 280 280"
            role="img"
            aria-label={`${title}. Vector (${vector[0].toFixed(3)}, ${vector[1].toFixed(3)}). Axes range from minus ${extent} to ${extent}.`}
        >
            <text x="140" y="22" textAnchor="middle">
                {title}
            </text>
            <g transform="translate(140 145)">
                <path d="M-100 0H100 M0 -100V100" className="sci-axis" />
                {ellipse !== undefined && (
                    <ellipse rx={0.1 * scale} ry={(0.1 / ellipse) * scale} className="sci-envelope" />
                )}
                {ellipse === undefined && <circle r={0.1 * scale} className="sci-envelope" />}
                <line x2={vector[0] * scale} y2={-vector[1] * scale} className="sci-vector" />
                <circle cx={vector[0] * scale} cy={-vector[1] * scale} r="4" fill="currentColor" />
                <text x="103" y="-7">
                    {extent}
                </text>
                <text x="6" y="-100">
                    {extent}
                </text>
                <text x="87" y="20">
                    {ellipse === undefined ? "u₁" : "v₁"}
                </text>
                <text x="-26" y="-85">
                    {ellipse === undefined ? "u₂" : "v₂"}
                </text>
            </g>
            <text x="140" y="272" textAnchor="middle">
                ({vector[0].toFixed(3)}, {vector[1].toFixed(3)})
            </text>
        </svg>
    );
}

export function NoiseExperiment() {
    const [sigma, setSigma] = useState(0.2);
    const [angle, setAngle] = useState(45);
    const result = inverseNoise(sigma, angle);
    return (
        <Figure
            id="inverse-noise"
            title="Equal data errors, unequal reconstruction errors"
            size="wide"
            caption={
                <>
                    Figure 1. A real two-dimensional teaching model: A = diag(1, σ₂), U = V = I. Rotate a data
                    perturbation of fixed length 0.1; then reduce σ₂. The dashed circle and ellipse show all possible
                    endpoints. The panels use different, fixed scales: ±0.12 and ±2.1.
                </>
            }
        >
            <PredictReveal
                question="For A = diag(1, 0.2), which perturbation of length 0.1 causes the larger reconstruction error?"
                choices={[
                    { id: "first", label: "Along u₁" },
                    { id: "second", label: "Along u₂" },
                    { id: "same", label: "Both are equal" },
                ]}
                answer="second"
                explanation={
                    <p>
                        Along u₁ the error is 0.1; along u₂ it is 0.1 / 0.2 = 0.5. The inverse undoes the forward
                        contraction, multiplying noise in the second direction by five.
                    </p>
                }
            />
            <div className="sci-plots">
                <NoisePlot vector={result.noise} title="Data perturbation δb" extent={0.12} />
                <NoisePlot vector={result.error} title="Reconstruction error A†δb" extent={2.1} ellipse={sigma} />
            </div>
            <div className="sci-controls sci-sliders">
                <label>
                    Smallest singular value σ₂ = {sigma.toFixed(2)}
                    <input
                        aria-label="Smallest singular value"
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.01"
                        value={sigma}
                        onChange={(e) => setSigma(Number(e.target.value))}
                    />
                </label>
                <label>
                    Noise direction θ = {angle}°
                    <input
                        aria-label="Noise direction"
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                    />
                </label>
                <button
                    type="button"
                    onClick={() => {
                        setSigma(0.2);
                        setAngle(45);
                    }}
                >
                    Reset experiment
                </button>
            </div>
            <p role="status">
                Error norm: {result.norm.toFixed(3)}. Upper bound 0.1 / σ₂: {result.bound.toFixed(3)}.
            </p>
            <Stepper
                steps={[
                    {
                        title: "1. Resolve the data error",
                        content: <p>δb = 0.1(cos θ u₁ + sin θ u₂). Its length remains 0.1.</p>,
                    },
                    { title: "2. Undo each nonzero scale", content: <p>A†δb = 0.1 cos θ v₁ + (0.1 / σ₂) sin θ v₂.</p> },
                    {
                        title: "3. Find the worst direction",
                        content: (
                            <p>
                                For σ₂ &lt; 1 the bound is attained along ±u₂. At σ₂ = 1 every direction is equally
                                sensitive. At σ₂ = 0 the pseudoinverse discards the second mode; it cannot recover
                                information lost there.
                            </p>
                        ),
                    },
                ]}
            />
        </Figure>
    );
}
