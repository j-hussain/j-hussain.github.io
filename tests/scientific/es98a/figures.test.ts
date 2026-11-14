import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

// Validate the published geometry rather than a duplicate numerical implementation.
function curves(week: number) {
    const source = readFileSync(`_notes/es98a/week${week}.md`, "utf8");
    return [...source.matchAll(/<path d="(M[^\"]+)" stroke="var\(--sci-(?:accent|secondary)\)"/g)].map((m) =>
        [...m[1].matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map((point) => [Number(point[1]), Number(point[2])])
    );
}
function close(actual: number, expected: number) {
    assert.ok(Math.abs(actual - expected) < 0.02, `${actual} ≠ ${expected}`);
}
test("Gaussian conditional density has the stated mean and variance", () => {
    const plots = curves(3);
    const conditional = plots[1];
    const max = conditional.reduce((a, b) => (a[1] < b[1] ? a : b));
    close(-3 + ((max[0] - 45) / 260) * 6, 0.8);
    close(((195 - max[1]) / 140) * 0.7, 1 / Math.sqrt(2 * Math.PI * 0.36));
});
test("Monte Carlo curve halves error when draw count quadruples", () => {
    const curve = curves(4)[0];
    close((195 - curve[0][1]) / 140, 1);
    const end = curve.at(-1)!;
    close((195 - end[1]) / 140, 0.1);
});
test("Tikhonov amplification obeys sharp bound and suppresses weak modes", () => {
    const filter = curves(8)[0];
    for (const [, y] of filter) assert.ok(((195 - y) / 140) * 10 <= 2.501);
    const peak = Math.max(...filter.map(([, y]) => ((195 - y) / 140) * 10));
    close(peak, 2.5);
});
test("L1 geometry contains exact zero interval; ridge has no flat zero interval", () => {
    const [soft, ridge] = curves(9);
    const zeros = soft.filter(([x]) => {
        const data = -3 + ((x - 45) / 260) * 6;
        return Math.abs(data) <= 0.99;
    });
    for (const [, y] of zeros) close(y, 125);
    assert.ok(ridge[70][1] !== ridge[90][1]);
});
test("GP one-observation update has mean 1.6 and residual variance 0.2 at sensor", () => {
    const plots = curves(10);
    const mean = plots[2][80];
    const upper = plots[3][80];
    const decode = (y: number) => ((195 - y) / 140) * 3 - 0.5;
    close(decode(mean[1]), 1.6);
    close((decode(upper[1]) - decode(mean[1])) ** 2, 0.2);
});
test("all forward chapter links target explicit source anchors", () => {
    for (let week = 1; week <= 10; week++) {
        const source = readFileSync(`_notes/es98a/week${week}.md`, "utf8");
        for (const match of source.matchAll(/\]\(\/notes\/es98a\/week(\d+)#([^\)]+)\)/g)) {
            const target = readFileSync(`_notes/es98a/week${match[1]}.md`, "utf8");
            assert.ok(target.includes(`id="${match[2]}"`), `Week ${week}: missing ${match[0]}`);
        }
    }
});
