"""Freeze a validation checkout without sharing .next, ports, or writable sources."""
from pathlib import Path
import shutil, tempfile, json, hashlib, os

root = Path.cwd()
baseline = Path(os.environ.get("PX457_BASELINE", str(root)))
target = Path(tempfile.mkdtemp(prefix="px457-validation-"))
for name in ["src", "_notes", "docs", "public"]:
    shutil.copytree(baseline / name, target / name)
for name in ["package.json", "package-lock.json", "tsconfig.json", "next-env.d.ts", "next.config.ts", "postcss.config.mjs", "tailwind.config.ts", "eslint.config.mjs", ".prettierrc"]:
    if (baseline / name).exists(): shutil.copy2(baseline / name, target / name)
# Overlay only module-owned source onto a frozen successful baseline if supplied.
for folder in ["_notes/px457", "src/app/notes/px457", "src/components/scientific/modules/px457", "docs/scientific-publishing/modules/px457"]:
    # Mirror module-owned folders, including deletions such as removed placeholders.
    shutil.rmtree(target / folder, ignore_errors=True)
    shutil.copytree(root / folder, target / folder)
for name in ["_notes/px457.md", "src/lib/px457.ts"]:
    shutil.copy2(root / name, target / name)
(target / "node_modules").symlink_to(root / "node_modules", target_is_directory=True)
shutil.copytree(root / "tests/scientific/px457", target / "tests/scientific/px457")
shutil.copytree(root / "tests/browser/px457", target / "tests/browser/px457")
manifest = {}
for folder in ["_notes/px457", "src/app/notes/px457", "src/components/scientific/modules/px457", "docs/scientific-publishing/modules/px457", "tests/scientific/px457", "tests/browser/px457"]:
    for p in (root / folder).rglob("*"):
        if p.is_file():
            relative = p.relative_to(root)
            manifest[str(relative)] = hashlib.sha256((target / relative).read_bytes()).hexdigest()
for name in ["_notes/px457.md", "src/lib/px457.ts", "src/lib/scientific-mdx.tsx", "src/components/scientific/article.css", "src/components/scientific/index.ts", "src/components/scientific/core.tsx", "src/components/scientific/interactions.tsx"]:
    manifest[name] = hashlib.sha256((target / name).read_bytes()).hexdigest()
artifacts = root / "artifacts/px457"
(artifacts / "snapshot-path.txt").write_text(str(target))
(artifacts / "snapshot-manifest.json").write_text(json.dumps(manifest, indent=2)+"\n")
(artifacts / "snapshot-baseline.txt").write_text(str(baseline))
print(target)
