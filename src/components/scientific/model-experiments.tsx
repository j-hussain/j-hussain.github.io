"use client";

import { useState } from "react";
import { Figure } from "./core";
import { Panel } from "./diagram-primitives";
import { modelFamilies, modelValue, type ModelFamily, type Vec2 } from "./week1-math";

export function HookeExperiment() {
    const [strain, setStrain] = useState(1);
    const length = 90 + 24 * strain;
    return (
        <Figure
            id="hooke-experiment"
            title="Stretch twice as far; predict twice the stress"
            caption="An ideal material with fixed E = 2. Strains are rescaled and extension is exaggerated; assume the linear elastic regime throughout. Select a strain and compare the material with its position on the line."
        >
            <div className="sci-controls" role="group" aria-label="Rescaled strain">
                {[0, 1, 2].map((n) => (
                    <button key={n} aria-pressed={strain === n} onClick={() => setStrain(n)}>
                        Strain {n}
                    </button>
                ))}
            </div>
            <div className="sci-story-grid sci-story-two">
                <Panel
                    title="1. Stretch the material"
                    explanation={
                        <>
                            Strain ε = {strain}; the law predicts stress σ = {2 * strain}. The stiffness stays fixed.
                        </>
                    }
                >
                    <svg
                        className="sci-story-svg"
                        viewBox="0 0 260 250"
                        role="img"
                        aria-label={`Material at rescaled strain ${strain}, predicted stress ${2 * strain}`}
                    >
                        <path className="sci-axis" d="M35 65V155M125 55V165" strokeDasharray="4 4" />
                        <rect x="35" y="85" width={length} height="50" className="sci-fill-first sci-stroke-first" />
                        {[0, 1, 2, 3, 4].map((i) => (
                            <line
                                key={i}
                                x1={35 + (i * length) / 4}
                                x2={35 + (i * length) / 4}
                                y1="85"
                                y2="135"
                                className="sci-stroke-first"
                            />
                        ))}
                        {strain > 0 && (
                            <path
                                className="sci-stroke-ink"
                                fill="none"
                                strokeWidth="2"
                                d={`M${35 + length} 110h${20 * strain}m-8 -5l8 5-8 5`}
                            />
                        )}
                        <text x="35" y="193">
                            Dashed: unstretched end
                        </text>
                        <text x="35" y="219">
                            {strain ? "Pull →" : "No applied stress"}
                        </text>
                    </svg>
                </Panel>
                <Panel
                    title="2. Read the prediction"
                    explanation="Every selected point stays on σ = 2ε. A single E constrains all predictions together."
                >
                    <svg
                        className="sci-story-svg"
                        viewBox="0 0 260 250"
                        role="img"
                        aria-label={`Stress versus strain: point (${strain}, ${2 * strain}) on stress equals twice strain`}
                    >
                        <path className="sci-axis" d="M40 20V205H235" />
                        <path className="sci-stroke-first" strokeWidth="2.5" fill="none" d="M40 205L210 45" />
                        <path className="sci-envelope" d={`M40 ${205 - strain * 80}H${40 + strain * 85}V205`} />
                        <circle cx={40 + strain * 85} cy={205 - strain * 80} r="6" fill="currentColor" />
                        {[0, 1, 2].map((n) => (
                            <g key={n}>
                                <text x={36 + n * 85} y="225">
                                    {n}
                                </text>
                                <text x="17" y={210 - n * 80}>
                                    {n * 2}
                                </text>
                            </g>
                        ))}
                        <text x="48" y="25">
                            stress σ
                        </text>
                        <text x="148" y="246">
                            strain ε
                        </text>
                    </svg>
                </Panel>
            </div>
            <p className="sci-live-summary" role="status">
                ε = {strain} → σ = {2 * strain}, with E = 2.
            </p>
            <noscript>
                <p>
                    The initial diagram shows ε = 1 and σ = 2. Doubling ε to 2 gives σ = 4; at ε = 0 the predicted
                    stress is zero.
                </p>
            </noscript>
        </Figure>
    );
}

const first: Vec2 = [1, 0.5],
    second: Vec2 = [-0.5, 1],
    sum: Vec2 = [0.5, 1.5];
export function ModelFamilyExplorer() {
    const [family, setFamily] = useState<ModelFamily>("Linear");
    const curve = (theta: Vec2) =>
        Array.from({ length: 161 }, (_, i) => {
            const x = -1 + i / 80;
            return `${i ? "L" : "M"}${50 + (x + 1) * 240},${150 - modelValue(family, x, theta) * 45}`;
        }).join(" ");
    return (
        <Figure
            id="model-families"
            title="Change the features, keep linearity in the coefficients"
            caption="The solid result is the pointwise sum of the dashed and dotted curves. Only the feature functions change between views; the coefficient vectors and axis scales stay fixed. The quadratic is the subfamily with zero constant term; the Fourier example uses two real features, rather than the complex notation introduced below."
        >
            <div className="sci-controls" role="group" aria-label="Model family">
                {(Object.keys(modelFamilies) as ModelFamily[]).map((name) => (
                    <button key={name} onClick={() => setFamily(name)} aria-pressed={family === name}>
                        {name}
                    </button>
                ))}
            </div>
            <div className="sci-model-formula" role="status">
                {family}: M(x; θ) = {modelFamilies[family].formula}
            </div>
            <svg
                className="sci-model-svg"
                viewBox="0 0 580 300"
                role="img"
                aria-label={`${family} model: the sum of two parameter vectors produces the sum of their curves`}
            >
                <path className="sci-axis" d="M40 150H540M290 20V275" />
                {[-2, -1, 1, 2].map((y) => (
                    <g key={y}>
                        <path className="sci-axis" d={`M286 ${150 - y * 45}h8`} />
                        <text x="300" y={146 - y * 45}>
                            {y}
                        </text>
                    </g>
                ))}
                <text x="40" y="172">
                    −1
                </text>
                <text x="526" y="172">
                    1
                </text>
                <text x="550" y="156">
                    x
                </text>
                <path d={curve(first)} className="sci-stroke-first" strokeDasharray="9 5" />
                <path d={curve(second)} className="sci-stroke-second" strokeDasharray="2 5" />
                <path d={curve(sum)} className="sci-stroke-ink" />
            </svg>
            <div className="sci-curve-key">
                <span className="sci-color-first">– – θ = (1, ½)</span>
                <span className="sci-color-second">··· θ̃ = (−½, 1)</span>
                <span>━━ θ + θ̃ = (½, 1½)</span>
            </div>
            <p>
                Add the heights of the two patterned curves at any x: you get the height of the solid curve. Bending the
                graph does not break this rule.
            </p>
            <noscript>
                <p>
                    The linear example is shown. The same addition rule holds for the quadratic features x, x² and the
                    Fourier features sin(πx), cos(πx).
                </p>
            </noscript>
        </Figure>
    );
}
