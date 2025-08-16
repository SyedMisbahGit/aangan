# scripts/setup/setup-local-environment.ps1
# Local Environment Setup for Aangan Production Launch

param(
    [switch]$InstallGCloud,
    [switch]$InstallTerraform,
    [switch]$InstallNode,
    [switch]$InstallDocker,
    [switch]$InstallAll,
    [switch]$CheckOnly
)

Write-Host "🚀 Aangan Production Launch - Environment Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check version
function Get-ToolVersion {
    param([string]$Command, [string]$VersionArg = "--version")
    try {
        $version = & $Command $VersionArg 2>$null
        return $version.Split("`n")[0]
    }
    catch {
        return "Not installed"
    }
}

# Check current status
Write-Host "`n📋 Current Environment Status:" -ForegroundColor Yellow
$tools = @(
    @{Name = "Google Cloud CLI"; Command = "gcloud"; VersionArg = "version --format=value(client_tools.version)"; Required = $true},
    @{Name = "Terraform"; Command = "terraform"; VersionArg = "version"; Required = $true},
    @{Name = "Node.js"; Command = "node"; VersionArg = "--version"; Required = $true},
    @{Name = "npm"; Command = "npm"; VersionArg = "--version"; Required = $true},
    @{Name = "Docker"; Command = "docker"; VersionArg = "--version"; Required = $true},
    @{Name = "curl"; Command = "curl"; VersionArg = "--version"; Required = $true},
    @{Name = "PowerShell"; Command = "pwsh"; VersionArg = "--version"; Required = $false},
    @{Name = "Git"; Command = "git"; VersionArg = "--version"; Required = $true}
)

$missingTools = @()

foreach ($tool in $tools) {
    $installed = Test-Command $tool.Command
    if ($installed) {
        $version = Get-ToolVersion $tool.Command $tool.VersionArg
        Write-Host "  ✅ $($tool.Name): $version" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($tool.Name): Not installed" -ForegroundColor Red
        if ($tool.Required) {
            $missingTools += $tool.Name
        }
    }
}

if ($CheckOnly) {
    if ($missingTools.Count -eq 0) {
        Write-Host "`n✅ All required tools are installed!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Missing required tools: $($missingTools -join ', ')" -ForegroundColor Red
        Write-Host "Run this script with installation flags to install missing tools." -ForegroundColor Yellow
    }
    return
}

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
    Write-Host "⚠️  This script requires administrator privileges to install software." -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    return
}

# Install Chocolatey if not present
if (-not (Test-Command "choco")) {
    Write-Host "`n📦 Installing Chocolatey package manager..." -ForegroundColor Cyan
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Installation functions
function Install-GCloudCLI {
    Write-Host "`n☁️  Installing Google Cloud CLI..." -ForegroundColor Cyan
    
    # Download and install Google Cloud CLI
    $gcloudUrl = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
    $gcloudInstaller = "$env:TEMP\GoogleCloudSDKInstaller.exe"
    
    Write-Host "Downloading Google Cloud CLI installer..."
    (New-Object System.Net.WebClient).DownloadFile($gcloudUrl, $gcloudInstaller)
    
    Write-Host "Running Google Cloud CLI installer..."
    Start-Process -FilePath $gcloudInstaller -ArgumentList "/S" -Wait
    
    # Add to PATH
    $gcloudPath = "${env:ProgramFiles(x86)}\Google\Cloud SDK\google-cloud-sdk\bin"
    if (Test-Path $gcloudPath) {
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
        if ($currentPath -notlike "*$gcloudPath*") {
            [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$gcloudPath", "Machine")
        }
    }
    
    Write-Host "✅ Google Cloud CLI installation initiated. Please restart your terminal." -ForegroundColor Green
}

function Install-TerraformCLI {
    Write-Host "`n🏗️  Installing Terraform..." -ForegroundColor Cyan
    choco install terraform -y
    Write-Host "✅ Terraform installed successfully!" -ForegroundColor Green
}

function Install-NodeJS {
    Write-Host "`n🟢 Installing Node.js..." -ForegroundColor Cyan
    choco install nodejs -y
    Write-Host "✅ Node.js installed successfully!" -ForegroundColor Green
}

function Install-Docker {
    Write-Host "`n🐳 Installing Docker Desktop..." -ForegroundColor Cyan
    choco install docker-desktop -y
    Write-Host "✅ Docker Desktop installed successfully!" -ForegroundColor Green
    Write-Host "⚠️  Please restart your computer to complete Docker installation." -ForegroundColor Yellow
}

# Install based on flags
if ($InstallAll) {
    $InstallGCloud = $true
    $InstallTerraform = $true
    $InstallNode = $true
    $InstallDocker = $true
}

if ($InstallGCloud -or (-not (Test-Command "gcloud"))) {
    Install-GCloudCLI
}

if ($InstallTerraform -or (-not (Test-Command "terraform"))) {
    Install-TerraformCLI
}

if ($InstallNode -or (-not (Test-Command "node"))) {
    Install-NodeJS
}

if ($InstallDocker -or (-not (Test-Command "docker"))) {
    Install-Docker
}

# Additional tools via chocolatey
$additionalTools = @("curl", "jq", "git")
foreach ($tool in $additionalTools) {
    if (-not (Test-Command $tool)) {
        Write-Host "`n🔧 Installing $tool..." -ForegroundColor Cyan
        choco install $tool -y
    }
}

# Create environment configuration file
$envConfig = @"
# Aangan Production Environment Configuration
# Copy this to .env.production and fill in your values

# GCP Configuration
GCP_PROJECT_ID=your-gcp-project-id
GCP_REGION=us-central1
GCP_ZONE=us-central1-a

# Deployment Configuration
ENVIRONMENT=production
SLACK_WEBHOOK_URL=your-slack-webhook-url
PAGERDUTY_INTEGRATION_KEY=your-pagerduty-key

# Database Configuration
DATABASE_URL=your-production-database-url

# JWT Secrets (generate secure 32+ character strings)
JWT_ACCESS_SECRET=your-jwt-access-secret-minimum-32-chars
JWT_REFRESH_SECRET=your-jwt-refresh-secret-minimum-32-chars

# External Services
SENTRY_DSN=your-sentry-dsn

# Testing Configuration
CHAOS_ENVIRONMENT=staging
CHAOS_BASE_URL=https://staging-api.aangan.app
CHAOS_WEBSOCKET_URL=wss://staging-api.aangan.app
"@

$envConfigPath = ".\\.env.production.template"
$envConfig | Out-File -FilePath $envConfigPath -Encoding UTF8

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your terminal/PowerShell session" -ForegroundColor White
Write-Host "2. Run 'gcloud auth login' to authenticate with Google Cloud" -ForegroundColor White
Write-Host "3. Run 'gcloud config set project YOUR_PROJECT_ID' to set your project" -ForegroundColor White
Write-Host "4. Copy .env.production.template to .env.production and fill in your values" -ForegroundColor White
Write-Host "5. Run this script with -CheckOnly to verify installation" -ForegroundColor White

Write-Host "`n🎯 Environment configuration template created: $envConfigPath" -ForegroundColor Green
Write-Host "`n✅ Environment setup completed! Ready for Aangan production launch." -ForegroundColor Green
