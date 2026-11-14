# Accessibility

Use native buttons, radio groups and labelled range controls. Preserve visible focus and at least 44px control heights. A hover relationship must also be reachable by focus and tap. Use semantic IDs, underlines, labels and stroke patterns in addition to colour. Essential definitions belong in prose.

Give SVGs an accessible summary including current numerical values and axes. Use semantic figure captions. Announce short changing summaries rather than entire figures. Avoid autoplay and honour reduced motion. Keep deterministic initial state so server HTML and hydration agree.

Render a meaningful initial SVG without JavaScript; prediction explanations and subsequent step content use noscript fallbacks. Parameter manipulation requires JavaScript. No second graphics implementation is necessary. Long display equations scroll within their own block; the page must not scroll sideways. Test actual figure bounds because the site's body clips horizontal overflow.

Check desktop and narrow mobile, light/dark themes, keyboard focus, touch taps, reset paths and no-JavaScript reading. Browser tests are evidence for those interactions, not a substitute for assistive-technology review. Screen-reader announcement quality requires manual review with a real screen reader before claiming full compliance.

Week 1's static panel sequences preserve reading order when stacked. Every SVG has a descriptive accessible name; captions and panel prose retain the reasoning in text. Controls precede the new interactive graphics, use `aria-pressed`, and announce short state/formula changes. The model comparison distinguishes three curves by dash pattern as well as colour. The Cholesky sequence labels both basis edges and differentiates their strokes. Static figures add no keyboard stops or motion. Playwright ignores text on a `noscript` container; assert its rendered child paragraphs in a JavaScript-disabled context.
