@echo off
echo Running depcheck and generating report...
npx depcheck --json > dependency-report.json

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to run depcheck
    exit /b %ERRORLEVEL%
)

echo Depcheck completed. Report saved to dependency-report.json
