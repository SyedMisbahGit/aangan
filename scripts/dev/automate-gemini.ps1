# scripts/automate-gemini.ps1
param(
  [string]$PromptFile = "gemini-prompt.txt"
)

# 1. Run Gemini CLI
$Prompt = Get-Content $PromptFile -Raw
Write-Host "Running Gemini CLI..."
gemini -p "$Prompt" | Out-File -Encoding utf8 gemini-output.md

# 2. Apply code blocks
Write-Host "Applying code blocks from Gemini output..."
node scripts/apply-gemini-output.js

# 3. Install dependencies if package.json was updated
if (Select-String -Path gemini-output.md -Pattern "package.json") {
  Write-Host "package.json found in output. Running npm install..."
  npm install
}

# 4. Lint and test
Write-Host "Running lint and tests..."
npm run lint
npm run test 