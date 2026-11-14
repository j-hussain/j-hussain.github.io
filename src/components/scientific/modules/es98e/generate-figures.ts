/** Run with npx tsx src/components/scientific/modules/es98e/generate-figures.ts.
 * Updates only the seven module-owned inline SVGs. No random samples or React.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
    activation,
    correlatedVariance,
    gpOneObservation,
    graphAggregate,
    normalDensity,
    normalPosterior,
    odeExample,
    pcaExample,
} from "./math";

const ink = "currentColor",
    accent = "var(--sci-accent)",
    second = "var(--sci-secondary)";
const num = (x: number) => x.toFixed(3);
const text = (x: number, y: number, label: string, extra = "") => `<text x="${x}" y="${y}" ${extra}>${label}</text>`;
const line = (x1: number, y1: number, x2: number, y2: number, color = ink, dash = "") =>
    `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" stroke="${color}" strokeWidth="1.5" ${dash ? `strokeDasharray="${dash}"` : ""} />`;
const series = (points: number[][], color = accent, dash = "") =>
    `<path d="${points.map(([x, y], i) => `${i ? "L" : "M"}${num(x)} ${num(y)}`).join(" ")}" fill="none" stroke="${color}" strokeWidth="2" ${dash ? `strokeDasharray="${dash}"` : ""} />`;
const circle = (x: number, y: number, r = 3.5, color = ink) =>
    `<circle cx="${num(x)}" cy="${num(y)}" r="${r}" fill="${color}" />`;
function svg(name: string, height: number, label: string, content: string) {
    return `<svg data-es98e-diagram="${name}" role="img" aria-label="${label}" viewBox="0 0 400 ${height}" fill="none" xmlns="http://www.w3.org/2000/svg"><g fontSize="16" fontFamily="inherit" fill="currentColor">${content}</g></svg>`;
}
function plot(
    top: number,
    xmin: number,
    xmax: number,
    ymin: number,
    ymax: number,
    title: string,
    xlabel: string,
    ylabel: string
) {
    const x = (v: number) => 53 + ((v - xmin) / (xmax - xmin)) * 315;
    const y = (v: number) => top + 52 + ((ymax - v) / (ymax - ymin)) * 175;
    const axes =
        text(16, top + 22, title, 'fontWeight="600"') +
        line(53, top + 52, 53, top + 227) +
        line(53, top + 227, 368, top + 227) +
        text(24, top + 48, ylabel) +
        text(345, top + 268, xlabel) +
        text(46, top + 250, String(xmin)) +
        text(350, top + 250, String(xmax)) +
        text(12, top + 232, String(ymin)) +
        text(12, top + 62, String(ymax));
    return { x, y, axes };
}
const sample = (a: number, b: number, n = 180) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
const figures: { chapter: string; name: string; content: string }[] = [];

{
    let content = "";
    for (const [index, rho] of [0.8, -0.8].entries()) {
        const top = index * 290;
        const x = (v: number) => 205 + 55 * v,
            y = (v: number) => top + 155 - 55 * v;
        content += text(
            15,
            top + 25,
            `ρ = ${rho}: output variance ${correlatedVariance([1, 2], rho).toFixed(1)}`,
            'fontWeight="600"'
        );
        content += line(x(-2.5), y(0), x(2.5), y(0)) + line(x(0), y(-1.9), x(0), y(1.9));
        const ellipse = sample(0, 2 * Math.PI, 120).map((t) => {
            const a = Math.sqrt(1 + rho) * Math.cos(t),
                b = Math.sqrt(1 - rho) * Math.sin(t);
            return [x((a + b) / Math.SQRT2), y((a - b) / Math.SQRT2)];
        });
        content += series(ellipse, second) + line(x(0), y(0), x(1), y(2), accent) + circle(x(1), y(2), 3, accent);
        content +=
            text(250, top + 46, "g = (1,2)") +
            text(342, top + 176, "Δ₁") +
            text(213, top + 65, "Δ₂") +
            text(260, top + 275, "Equal input scales");
    }
    figures.push({
        chapter: "sensitivity",
        name: "sensitivity",
        content: svg(
            "sensitivity",
            580,
            "Equal-scale covariance ellipses at correlations plus and minus 0.8; gradient (1,2); output variances 8.2 and 1.8.",
            content
        ),
    });
}
{
    let content = "";
    for (const [i, ell] of [0.35, 1.2].entries()) {
        const p = plot(i * 320, -3, 3, -2.2, 2.7, `Lengthscale ℓ = ${ell}`, "x", "f");
        const xs = sample(-3, 3);
        const upper = xs.map((x) => {
            const v = gpOneObservation(x, ell);
            return [p.x(x), p.y(v.mean + 2 * Math.sqrt(v.variance))];
        });
        const lower = [...xs].reverse().map((x) => {
            const v = gpOneObservation(x, ell);
            return [p.x(x), p.y(v.mean - 2 * Math.sqrt(v.variance))];
        });
        content +=
            p.axes +
            `<path d="${[...upper, ...lower].map(([x, y], i) => `${i ? "L" : "M"}${num(x)} ${num(y)}`).join(" ")} Z" fill="${accent}" fillOpacity="0.13" />`;
        content +=
            series(
                xs.map((x) => [p.x(x), p.y(gpOneObservation(x, ell).covariance)]),
                second,
                "5 4"
            ) + series(xs.map((x) => [p.x(x), p.y(gpOneObservation(x, ell).mean)]));
        content += circle(p.x(0), p.y(1)) + text(64, i * 320 + 289, "solid: mean · dashed: covariance");
    }
    figures.push({
        chapter: "gaussian-processes",
        name: "gp-conditioning",
        content: svg(
            "gp-conditioning",
            640,
            "One-observation GP posterior. Short and long lengthscales change the reach of the mean update and uncertainty reduction on equal axes.",
            content
        ),
    });
}
{
    let content = "";
    for (const [i, name] of ["tanh", "relu"].entries()) {
        const p = plot(
            i * 300,
            -3,
            3,
            -1.2,
            3.2,
            name === "tanh" ? "Tanh and its derivative" : "ReLU and its derivative",
            "z",
            "value"
        );
        content += p.axes;
        content += series(sample(-3, 3).map((x) => [p.x(x), p.y(activation(x)[name as "tanh" | "relu"])]));
        for (const [a, b] of name === "relu"
            ? [
                  [-3, -0.001],
                  [0.001, 3],
              ]
            : [[-3, 3]])
            content += series(
                sample(a, b).map((x) => [
                    p.x(x),
                    p.y(name === "tanh" ? activation(x).tanhDerivative : activation(x).reluDerivative!),
                ]),
                second,
                "5 4"
            );
        content += text(62, i * 300 + 287, "solid: function · dashed: derivative");
    }
    figures.push({
        chapter: "neural-learning",
        name: "activations",
        content: svg(
            "activations",
            610,
            "Tanh and ReLU functions with derivatives. ReLU's derivative at zero is omitted.",
            content
        ),
    });
}
{
    const a = [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0],
        ],
        values = [1, 2, 4],
        out = graphAggregate(values, a);
    let content = "";
    for (let k = 0; k < 2; k++) {
        const top = k * 250,
            vals = k ? [...values].reverse() : values,
            outputs = k ? [...out].reverse() : out;
        content += text(18, top + 28, k ? "Reverse storage order" : "Original storage order", 'fontWeight="600"');
        content += line(75, top + 95, 200, top + 95) + line(200, top + 95, 325, top + 95);
        for (let j = 0; j < 3; j++) {
            const x = 75 + 125 * j;
            content += `<circle cx="${x}" cy="${top + 95}" r="23" fill="var(--background-color)" stroke="${accent}" strokeWidth="2" />`;
            content +=
                text(x, top + 101, String(vals[j]), 'textAnchor="middle"') +
                text(x, top + 151, `→ ${outputs[j]}`, 'textAnchor="middle"');
        }
        content += text(34, top + 199, "self + neighbours → mean = 16/3");
    }
    figures.push({
        chapter: "symmetry-graphs",
        name: "graph-permutation",
        content: svg(
            "graph-permutation",
            480,
            "Path graph features 1,2,4 update to 3,7,6. Reversed node order gives 6,7,3; mean 16/3 is invariant.",
            content
        ),
    });
}
{
    const p = plot(0, 0, 6, -0.6, 1, "Exact solution and perturbed trial", "x", "u");
    const r = plot(310, 0, 6, -0.35, 0.35, "Residual of the trial (different y scale)", "x", "r");
    const xs = sample(0, 6, 300);
    let content =
        p.axes +
        series(
            xs.map((x) => [p.x(x), p.y(odeExample(x).exact)]),
            ink,
            "5 4"
        ) +
        series(xs.map((x) => [p.x(x), p.y(odeExample(x).trial)]));
    content +=
        text(58, 287, "dashed: exact · solid: trial") +
        r.axes +
        series(
            xs.map((x) => [r.x(x), r.y(odeExample(x).residual)]),
            second
        );
    figures.push({
        chapter: "differential-equations",
        name: "ode-residual",
        content: svg(
            "ode-residual",
            600,
            "Damped sinusoid and a trial with 0.05 sin(6x) perturbation; residual about 0.3, shown on a different vertical scale.",
            content
        ),
    });
}
{
    const x = (v: number) => 200 + 55 * v,
        y = (v: number) => 235 - 55 * v;
    let content =
        text(18, 25, "Keep the long axis, discard its normal", 'fontWeight="600"') +
        line(x(-3), y(0), x(3), y(0)) +
        line(x(0), y(-3), x(0), y(3));
    content += line(x(-2.5), y(-2.5), x(2.5), y(2.5), accent);
    for (const { point, projection } of pcaExample())
        content +=
            line(x(point[0]), y(point[1]), x(projection[0]), y(projection[1]), second, "4 4") +
            circle(x(point[0]), y(point[1])) +
            circle(x(projection[0]), y(projection[1]), 2.5, accent);
    content +=
        text(347, 258, "x₁") +
        text(210, 70, "x₂") +
        text(20, 435, "retained variance = 3") +
        text(20, 465, "mean squared residual = 1") +
        text(20, 495, "Equal units on both axes");
    figures.push({
        chapter: "latent-geometry",
        name: "pca",
        content: svg(
            "pca",
            515,
            "PCA projection for empirical covariance [[2,1],[1,2]]. Retained variance 3 and mean squared residual 1; equal axes.",
            content
        ),
    });
}
{
    const p = plot(0, -3, 5, 0, 0.65, "Multiply densities, then normalise", "g", "density");
    const post = normalPosterior(0, 1, [2], 1),
        xs = sample(-3, 5);
    let content =
        p.axes +
        series(
            xs.map((x) => [p.x(x), p.y(normalDensity(x, 0, 1))]),
            ink,
            "5 4"
        ) +
        series(
            xs.map((x) => [p.x(x), p.y(normalDensity(x, 2, 1))]),
            second,
            "2 4"
        ) +
        series(xs.map((x) => [p.x(x), p.y(normalDensity(x, post.mean, post.variance))]));
    content += text(48, 290, "dashed: prior · dotted: likelihood") + text(48, 317, "solid: posterior N(1, 1/2)");
    figures.push({
        chapter: "variational-inference",
        name: "normal-inference",
        content: svg(
            "normal-inference",
            340,
            "Prior N(0,1), rescaled likelihood centred at 2, posterior N(1,1/2), plotted on the same scales.",
            content
        ),
    });
}

async function generate() {
    for (const figure of figures) {
        const file = path.join(process.cwd(), "_notes/es98e", `${figure.chapter}.md`);
        const source = await readFile(file, "utf8");
        const img = new RegExp(`<img src="/scientific/es98e/${figure.name}\\.svg"[^>]*?/>`);
        const inline = new RegExp(`<svg data-es98e-diagram="${figure.name}"[\\s\\S]*?</svg>`);
        if (!img.test(source) && !inline.test(source)) throw new Error(`Missing figure ${figure.name}`);
        await writeFile(file, source.replace(img.test(source) ? img : inline, figure.content));
    }
}
generate().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});
