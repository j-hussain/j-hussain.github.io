# Archived project gallery

The current site links to `/work`, which contains the existing “coming soon” page. The former `/projects` gallery and detail pages imported `src/app/data/projects.ts`, a file absent from both the checkout and repository history. Those imports blocked production builds and TypeScript checks.

The original gallery source is preserved byte-for-byte in the adjacent `.tsx.txt` files, using its former directory structure. These are reference snapshots, excluded from compilation. All project media remains under `public/projects`. No project descriptions or personal work claims have been reconstructed.

`/projects` and `/projects/[slug]` now redirect to `/work`. Restore the gallery only when its real project data is available, then move these sources back and validate their routes and interactions.
