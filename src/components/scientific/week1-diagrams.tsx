import { Figure } from "./core";
import { Panel, Plane, Vector, sx, sy } from "./diagram-primitives";
import { orthogonalCoordinates } from "./projection-math";
import {
    apply2,
    transpose2,
    dot2,
    outerAction,
    fitStiffness,
    directionalSize,
    choleskyFactor,
    type Vec2,
} from "./week1-math";

export function ParsevalDiagram() {
    return (
        <Figure
            id="parseval-areas"
            title="Different coordinates, the same total area"
            caption="Each square has side length |αⱼ|, so its area is αⱼ². Both panels use the same area scale. Rotating the orthonormal rulers redistributes the total 5; it does not change x = (2, 1). The square pictures illustrate the real two-dimensional case of the identity proved above."
        >
            <div className="sci-story-grid sci-story-two">
                {[0, 45].map((degrees) => {
                    const { a, b } = orthogonalCoordinates([2, 1], degrees);
                    return (
                        <Panel
                            key={degrees}
                            title={`Rulers rotated ${degrees}°`}
                            explanation={`${(a * a).toFixed(1)} + ${(b * b).toFixed(1)} = 5.0 units of squared length.`}
                        >
                            <svg
                                className="sci-story-svg"
                                viewBox="0 0 260 210"
                                role="img"
                                aria-label={`Squared coordinate areas ${(a * a).toFixed(1)} and ${(b * b).toFixed(1)}, total 5`}
                            >
                                <rect
                                    x="25"
                                    y={150 - Math.abs(a) * 45}
                                    width={Math.abs(a) * 45}
                                    height={Math.abs(a) * 45}
                                    className="sci-fill-first sci-stroke-first"
                                />
                                <rect
                                    x="175"
                                    y={150 - Math.abs(b) * 45}
                                    width={Math.abs(b) * 45}
                                    height={Math.abs(b) * 45}
                                    className="sci-fill-second sci-stroke-second"
                                    strokeDasharray="4 3"
                                />
                                <text x="25" y="180">
                                    α₁² = {(a * a).toFixed(1)}
                                </text>
                                <text x="175" y="180">
                                    α₂² = {(b * b).toFixed(1)}
                                </text>
                                <text x="140" y="130">
                                    +
                                </text>
                            </svg>
                        </Panel>
                    );
                })}
            </div>
        </Figure>
    );
}

export function OuterProductDiagram() {
    const output = outerAction([1, 0], [0, 2], [2, 1]);
    return (
        <Figure
            id="outer-product-story"
            title="One reading, one output direction"
            size="wide"
            caption="Here x = (2, 1), a = (1, 0) and b = (0, 2). All inputs with first coordinate 2 produce the same output (0, 4): the second input coordinate is discarded. This illustrates why the range of a ⊗ b is at most one-dimensional."
        >
            <div className="sci-story-grid">
                <Panel
                    title="1. Measure along a"
                    explanation="Project x onto the horizontal unit direction a. Read off the scalar 2."
                >
                    <Plane label="Input x=(2,1), measuring vector a=(1,0), horizontal projection 2">
                        <Vector to={[2, 1]} kind="ink" />
                        <Vector to={[1, 0]} />
                        <path className="sci-envelope" d={`M${sx(2)} ${sy(1)}V${sy(0)}`} />
                        <text x={sx(2) + 9} y={sy(1)}>
                            x
                        </text>
                        <text x={sx(1)} y={sy(0) - 12}>
                            a
                        </text>
                        <text x={sx(2)} y={sy(0) + 22}>
                            2
                        </text>
                    </Plane>
                </Panel>
                <Panel
                    title="2. Keep one number"
                    explanation="The inner product is a scalar, not a vector. It remembers only the chosen measurement."
                >
                    <svg
                        className="sci-story-svg"
                        viewBox="0 0 260 250"
                        role="img"
                        aria-label="The inner product of a and x equals 2"
                    >
                        <text x="130" y="115" textAnchor="middle" className="sci-large-equation">
                            ⟨a, x⟩ = 2
                        </text>
                        <path className="sci-axis" d="M35 155H225m-8 -5l8 5-8 5" />
                        <text x="130" y="187" textAnchor="middle">
                            measure → reconstruct
                        </text>
                    </svg>
                </Panel>
                <Panel
                    title="3. Place it along b"
                    explanation="Multiply b by that reading. The output is 2b = (0, 4), regardless of the discarded coordinate."
                >
                    <Plane label="Reconstruct along b=(0,2): output 2b=(0,4)">
                        <Vector to={output} kind="second" />
                        <Vector to={[0, 2]} />
                        <text x="55" y={sy(4)}>
                            2b = (0, 4)
                        </text>
                        <text x="55" y={sy(2)}>
                            b = (0, 2)
                        </text>
                    </Plane>
                </Panel>
            </div>
        </Figure>
    );
}

export function LeastSquaresDiagram() {
    const { stiffness, prediction: p, residual: r, loss } = fitStiffness([1, 2], [2, 3]);
    return (
        <Figure
            id="fit-as-projection"
            title="The same fit, seen in two different spaces"
            caption={`The vertical errors on the left become the coordinates of one residual vector on the right: r = (${r[0].toFixed(1)}, ${r[1].toFixed(1)}). Both views minimise the same squared error, ${loss.toFixed(1)}. The right-hand line is a line of possible prediction pairs, not the stress–strain graph.`}
        >
            <div className="sci-story-grid sci-story-two">
                <Panel
                    title="1. Fit the stress–strain graph"
                    explanation="One E sets the slope. Each vertical segment is observed stress minus predicted stress."
                >
                    <Plane label="Stress versus strain: observations (1,2),(2,3), fitted slope 1.6">
                        <path
                            className="sci-stroke-first"
                            strokeWidth="2.5"
                            d={`M${sx(0)} ${sy(0)}L${sx(2.5)} ${sy(2.5 * stiffness)}`}
                        />
                        {([1, 2] as const).map((x, i) => (
                            <g key={x}>
                                <line
                                    x1={sx(x)}
                                    x2={sx(x)}
                                    y1={sy(p[i])}
                                    y2={sy(i + 2)}
                                    className="sci-stroke-second"
                                    strokeWidth="3"
                                />
                                <circle cx={sx(x)} cy={sy(i + 2)} r="4" fill="currentColor" />
                                <text x={sx(x) + 9} y={sy(i + 2) + (i ? 18 : -5)}>
                                    {i ? "−0.2" : "+0.4"}
                                </text>
                            </g>
                        ))}
                        <text x="48" y="22">
                            stress
                        </text>
                        <text x="192" y="232">
                            strain
                        </text>
                    </Plane>
                </Panel>
                <Panel
                    title="2. Project the observation pair"
                    explanation="Now the axes mean stress in experiment 1 and stress in experiment 2. The shortest residual is perpendicular to the prediction line."
                >
                    <Plane label="Observation space: y=(2,3) projects to p=(1.6,3.2) on span(1,2), with perpendicular residual (.4,-.2)">
                        <path className="sci-envelope" d={`M${sx(0)} ${sy(0)}L${sx(2)} ${sy(4)}`} />
                        <Vector to={p} />
                        <Vector to={[2, 3]} kind="ink" />
                        <Vector from={p} to={[2, 3]} kind="second" />
                        <path
                            className="sci-stroke-second"
                            fill="none"
                            d={`M${sx(1.52)} ${sy(3.04)}L${sx(1.68)} ${sy(2.96)}L${sx(1.76)} ${sy(3.12)}`}
                        />
                        <text x="49" y="22">
                            stress 2
                        </text>
                        <text x="173" y="232">
                            stress 1
                        </text>
                        <text x={sx(p[0]) - 25} y={sy(p[1]) - 8}>
                            p
                        </text>
                        <text x={sx(2) + 10} y={sy(3) + 5}>
                            y
                        </text>
                    </Plane>
                </Panel>
            </div>
        </Figure>
    );
}

export function AdjointDiagram() {
    const a = [
            [1, 1],
            [0, 1],
        ] as const,
        x = [1, 2] as const,
        y = [2, 1] as const;
    const ax = apply2(a, x),
        aty = apply2(transpose2(a), y);
    return (
        <Figure
            id="adjoint-measurement"
            title="Move the vector forwards—or move the measuring vector backwards"
            caption="A = ((1, 1), (0, 1)) is a shear; x = (1, 2) and y = (2, 1). Both routes produce 8. A* transfers a linear measurement to the input space; it is not generally the inverse of A. This real example uses A* = Aᵀ; the complex definition also conjugates."
        >
            <div className="sci-story-grid sci-story-two">
                <Panel
                    title="1. Measure in the output space"
                    explanation={`First transform x to Ax = (3, 2). Then ⟨Ax, y⟩ = 3·2 + 2·1 = ${dot2(ax, y)}.`}
                >
                    <Plane label="Output vectors Ax=(3,2) and measuring vector y=(2,1), inner product 8">
                        <Vector to={ax} kind="ink" />
                        <Vector to={y} />
                        <text x={sx(3) + 8} y={sy(2)}>
                            Ax
                        </text>
                        <text x={sx(2) + 10} y={sy(1) + 5}>
                            y
                        </text>
                    </Plane>
                </Panel>
                <Panel
                    title="2. Measure in the input space"
                    explanation={`Leave x unchanged. Move y to A*y = (2, 3), so ⟨x, A*y⟩ = 1·2 + 2·3 = ${dot2(x, aty)}.`}
                >
                    <Plane label="Input vector x=(1,2) and transferred measuring vector A*y=(2,3), inner product 8">
                        <Vector to={x} kind="ink" />
                        <Vector to={aty} />
                        <text x={sx(1) - 18} y={sy(2) - 5}>
                            x
                        </text>
                        <text x={sx(2) + 9} y={sy(3)}>
                            A*y
                        </text>
                    </Plane>
                </Panel>
            </div>
        </Figure>
    );
}

export function PositivityDiagram() {
    return (
        <Figure
            id="positive-directions"
            title="Positive means every direction—not every matrix entry"
            size="wide"
            caption="All three real diagonal matrices are self-adjoint. For unit x = (cos θ, sin θ), the plotted quantity is q(θ) = ⟨Ax, x⟩ = 2 cos²θ + λ₂ sin²θ. Angles 0 to π cover every unoriented line in the plane. The same vertical scale makes strict positivity, a zero direction, and a negative direction directly comparable."
        >
            <div className="sci-story-grid">
                {[
                    {
                        lambda: 1,
                        name: "Positive definite",
                        explanation:
                            "Every nonzero direction has positive squared size. On the unit circle the minimum is 1.",
                    },
                    {
                        lambda: 0,
                        name: "Positive semidefinite",
                        explanation:
                            "The vertical direction has size zero, despite being nonzero. No direction has negative size.",
                    },
                    {
                        lambda: -1,
                        name: "Indefinite",
                        explanation:
                            "The vertical direction gives −1. One negative value is enough to rule out positive semidefiniteness.",
                    },
                ].map(({ lambda, name, explanation }) => {
                    const path = Array.from(
                        { length: 101 },
                        (_, i) =>
                            `${i ? "L" : "M"}${35 + (190 * i) / 100},${155 - directionalSize(lambda, (i * Math.PI) / 100) * 45}`
                    ).join(" ");
                    return (
                        <Panel key={lambda} title={name} explanation={explanation}>
                            <svg
                                className="sci-story-svg"
                                viewBox="0 0 260 250"
                                role="img"
                                aria-label={`A=diag(2,${lambda}), directional quadratic form ranges from ${lambda} to 2`}
                            >
                                <text x="35" y="25">
                                    A = diag(2, {lambda})
                                </text>
                                <path className="sci-axis" d="M35 45V210M35 155H230" />
                                {[2, 0, -1].map((n) => (
                                    <text key={n} x="9" y={160 - 45 * n}>
                                        {n}
                                    </text>
                                ))}
                                <path
                                    d={path}
                                    className={lambda < 0 ? "sci-stroke-second" : "sci-stroke-first"}
                                    strokeWidth="2.5"
                                    fill="none"
                                />
                                <circle cx="130" cy={155 - 45 * lambda} r="4" fill="currentColor" />
                                <text x="32" y="232">
                                    0
                                </text>
                                <text x="116" y="232">
                                    π/2
                                </text>
                                <text x="221" y="232">
                                    π
                                </text>
                                <text x="238" y="155">
                                    θ
                                </text>
                            </svg>
                        </Panel>
                    );
                })}
            </div>
        </Figure>
    );
}

export function CholeskyDiagram() {
    const square: Vec2[] = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
    ];
    const intermediate = square.map((x) => apply2(transpose2(choleskyFactor), x));
    const final = intermediate.map((x) => apply2(choleskyFactor, x));
    return (
        <Figure
            id="cholesky-steps"
            title="Read LL* from right to left"
            size="wide"
            caption="The solid first edge and dashed second edge track the two basis vectors; all panels use the same coordinate scale. First apply L*, then L. The final edges are (2, 1) and (1, 2), the columns of A. The parallelogram is a transformed unit square, not a probability contour or a plot of the quadratic form."
        >
            <div className="sci-story-grid">
                {[
                    {
                        points: square,
                        title: "1. Start with a unit square",
                        text: "The edges are e₁ and e₂. Tracking them determines the entire linear transformation.",
                    },
                    {
                        points: intermediate,
                        title: "2. Apply the upper factor L*",
                        text: "The first edge becomes (√2, 0); the second becomes (1/√2, √(3/2)).",
                    },
                    {
                        points: final,
                        title: "3. Apply the lower factor L",
                        text: "Together the two factors produce A = LL*. Applying L twice would give a different result.",
                    },
                ].map(({ points, title, text }) => (
                    <Panel key={title} title={title} explanation={text}>
                        <Plane
                            label={`${title}: polygon vertices ${points.map((p) => `(${p.map((n) => n.toFixed(3)).join(", ")})`).join(", ")}`}
                        >
                            <polygon
                                points={points.map((p) => `${sx(p[0])},${sy(p[1])}`).join(" ")}
                                className="sci-fill-first sci-stroke-ink"
                                fillOpacity="0.5"
                            />
                            <Vector to={points[1]} />
                            <g strokeDasharray="5 4">
                                <Vector to={points[3]} kind="second" />
                            </g>
                            <text x={sx(points[1][0]) + 8} y={sy(points[1][1]) + 16}>
                                1st
                            </text>
                            <text x={sx(points[3][0]) - 25} y={sy(points[3][1]) - 10}>
                                2nd
                            </text>
                        </Plane>
                    </Panel>
                ))}
            </div>
        </Figure>
    );
}
