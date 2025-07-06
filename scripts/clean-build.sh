#!/usr/bin/env bash
# clean-build.sh  –  blow away all caches, rebuild fresh

set -e

echo "⛔  Killing any running dev servers…"
pkill -f vite || true
pkill -f node || true

echo "🧹  Removing build artefacts & caches…"
rm -rf node_modules .vite dist dev-dist .next coverage
rm -rf backend/node_modules backend/dist tmp || true

echo "📦  Fresh install (root + backend)…"
npm install                     # root
(cd backend && npm install)

echo "⚙️  Regenerating Tailwind + TypeScript artefacts…"
npm run lint -- --fix           # auto‑fix lint
npm run typecheck               # ts-node / tsc strict check

echo "🏗️  Building backend…"
(cd backend && npm run build)   # if you have a build step

echo "🖥️  Building frontend (Vite prod)…"
npm run build

echo "✅  Clean build complete."
echo "👉  Now run:  npm run preview   (or  npm run dev) " 