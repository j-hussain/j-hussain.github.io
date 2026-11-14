/** Real 2D diagonal teaching model; not a numerical SVD solver. */
export function inverseNoise(sigma: number, angle: number, magnitude = 0.1) {
    if (
        !Number.isFinite(sigma) ||
        sigma < 0 ||
        sigma > 1 ||
        !Number.isFinite(angle) ||
        !Number.isFinite(magnitude) ||
        magnitude < 0
    )
        throw new RangeError("Expected 0 ≤ sigma ≤ 1, finite angle and nonnegative magnitude");
    const radians = (angle * Math.PI) / 180;
    const noise = [magnitude * Math.cos(radians), magnitude * Math.sin(radians)] as const;
    const error = [noise[0], sigma === 0 ? 0 : noise[1] / sigma] as const;
    return { noise, error, norm: Math.hypot(...error), bound: magnitude / (sigma || 1) };
}
