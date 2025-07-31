# clean-build.ps1 – blow away all caches, rebuild fresh

Write-Host "⛔  Killing any running dev servers…"
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process vite -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "🧹  Removing build artefacts and caches…"
Remove-Item -Recurse -Force node_modules,.vite,dist,dev-dist,.next,coverage -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backend\node_modules,backend\dist,tmp -ErrorAction SilentlyContinue

Write-Host "📦  Fresh install (root and backend)…"
npm install
Push-Location backend
npm install
Pop-Location

Write-Host "⚙️  Regenerating Tailwind and TypeScript artefacts…"
npm run lint -- --fix
npm run typecheck

Write-Host "🏗️  Building backend…"
Push-Location backend
npm run build
Pop-Location

Write-Host "🖥️  Building frontend (Vite prod)…"
npm run build

Write-Host "✅  Clean build complete."
Write-Host "👉  Now run:  npm run preview   (or  npm run dev) " 