export function orthogonalCoordinates(x: readonly [number, number], degrees: number) {
    if (![...x, degrees].every(Number.isFinite)) throw new RangeError("Finite vector and angle required");
    const angle = (degrees * Math.PI) / 180;
    const u = [Math.cos(angle), Math.sin(angle)] as const;
    const v = [-u[1], u[0]] as const;
    const a = x[0] * u[0] + x[1] * u[1];
    const b = x[0] * v[0] + x[1] * v[1];
    const projection = [a * u[0], a * u[1]] as const;
    const residual = [b * v[0], b * v[1]] as const;
    return { u, v, a, b, projection, residual, energy: a * a + b * b };
}
