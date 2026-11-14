export type Vec2 = readonly [number, number];
export type Mat2 = readonly [Vec2, Vec2];

export const dot2 = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1];
export const apply2 = (a: Mat2, x: Vec2): Vec2 => [dot2(a[0], x), dot2(a[1], x)];
export const transpose2 = (a: Mat2): Mat2 => [
    [a[0][0], a[1][0]],
    [a[0][1], a[1][1]],
];
export const outerAction = (a: Vec2, b: Vec2, x: Vec2): Vec2 => {
    const measurement = dot2(a, x);
    return [measurement * b[0], measurement * b[1]];
};
export function fitStiffness(strains: Vec2, stresses: Vec2) {
    const denominator = dot2(strains, strains);
    if (!denominator) throw new RangeError("At least one strain must be nonzero");
    const stiffness = dot2(strains, stresses) / denominator;
    const prediction: Vec2 = [stiffness * strains[0], stiffness * strains[1]];
    const residual: Vec2 = [stresses[0] - prediction[0], stresses[1] - prediction[1]];
    return { stiffness, prediction, residual, loss: dot2(residual, residual) };
}

export const modelFamilies = {
    Linear: { formula: "θ₁ + θ₂x", features: (x: number): Vec2 => [1, x] },
    Quadratic: { formula: "θ₁x + θ₂x²", features: (x: number): Vec2 => [x, x * x] },
    Fourier: {
        formula: "θ₁ sin(πx) + θ₂ cos(πx)",
        features: (x: number): Vec2 => [Math.sin(Math.PI * x), Math.cos(Math.PI * x)],
    },
};
export type ModelFamily = keyof typeof modelFamilies;
export const modelValue = (family: ModelFamily, x: number, theta: Vec2) =>
    dot2(modelFamilies[family].features(x), theta);
export const directionalSize = (secondEigenvalue: number, angle: number) =>
    2 * Math.cos(angle) ** 2 + secondEigenvalue * Math.sin(angle) ** 2;
export const exampleMatrix: Mat2 = [
    [2, 1],
    [1, 2],
];
export const choleskyFactor: Mat2 = [
    [Math.SQRT2, 0],
    [1 / Math.SQRT2, Math.sqrt(1.5)],
];
export const principalRoot: Mat2 = [
    [(Math.sqrt(3) + 1) / 2, (Math.sqrt(3) - 1) / 2],
    [(Math.sqrt(3) - 1) / 2, (Math.sqrt(3) + 1) / 2],
];
