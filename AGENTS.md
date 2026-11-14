# Scientific publishing

For mathematical articles or scientific components, start at [the scientific publishing handoff](docs/scientific-publishing/README.md). Read its decisions, editorial guide, architecture and component reference; verify implementation details in code. Read the whole assigned module and its curriculum map before editing chapters. Motivation, cumulative reasoning and mathematical rigour matter more than visual polish or interaction density. Static explanatory sequences are welcome; there is no figure quota.

Use the existing reviewed MDX pipeline and scoped article styles. Put numerical logic outside React; test analytic cases, invariants and boundaries. Update component documentation and working gallery examples whenever reusable APIs or conventions change. Validate TypeScript, build, numerical tests and desktop/mobile browser tests. Never describe unchecked behaviour as tested.

For parallel module assignments, follow [exclusive ownership and integration rules](docs/scientific-publishing/parallel-workflow.md). One module per worker; one designated writer for shared APIs, CSS, exports, config and global docs. Record exact paths before edits. Do not run competing builds/browser suites on the fixed test ports. Leave a module handoff using the [templates](docs/scientific-publishing/handoff-templates.md); new numerical files are not automatically picked up by `test:math`.

ES98A proceeds chronologically: use `docs/scientific-publishing/es98a-curriculum-map.md`. Week 1 is the editorial/visual pilot; Week 2 is experimental; later sources are unreviewed. The latest visual pass is locally validated, not yet user-reviewed. Do not infer a full migration from praise of the pilot; explicit later module assignments set their own scope. Preserve rigour, not erroneous source statements; document corrections. Deployment requires approval. Never stage or revert unrelated migration changes indiscriminately.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
