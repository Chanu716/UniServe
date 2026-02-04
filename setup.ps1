# Campus Resource Booking System - Setup Script
# PowerShell script to set up the development environment

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "UniServe - Development Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 16+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL not found. Please install PostgreSQL 12+ from https://www.postgresql.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setting up Backend..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Backend setup
Set-Location src\backend

if (Test-Path ".env") {
    Write-Host "✓ Backend .env file already exists" -ForegroundColor Green
} else {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file. Please update it with your database credentials." -ForegroundColor Yellow
}

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..\..

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setting up Frontend..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Frontend setup
Set-Location src\frontend

if (Test-Path ".env") {
    Write-Host "✓ Frontend .env file already exists" -ForegroundColor Green
} else {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
}

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..\..

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Database Setup Instructions" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please run the following commands to set up the database:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create database:" -ForegroundColor White
Write-Host "   createdb crbs_db" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Run schema:" -ForegroundColor White
Write-Host "   psql -d crbs_db -f src\database\schema.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Update backend .env file with your PostgreSQL credentials" -ForegroundColor White
Write-Host "   Edit: src\backend\.env" -ForegroundColor Cyan
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend (in one terminal):" -ForegroundColor White
Write-Host "   cd src\backend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend (in another terminal):" -ForegroundColor White
Write-Host "   cd src\frontend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open http://localhost:3000 in your browser" -ForegroundColor Yellow
Write-Host ""
