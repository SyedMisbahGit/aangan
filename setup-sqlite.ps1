# Create .env.development file
$envContent = @"
NODE_ENV=development
DB_PATH=./whispers.db
JWT_SECRET=dev_jwt_secret_key_$(Get-Random -Minimum 1000000000000000 -Maximum 9999999999999999)
PORT=3001
"@

# Write to .env.development
$envContent | Out-File -FilePath ".env.development" -Encoding utf8

Write-Host "Created .env.development file with SQLite configuration"

# Install SQLite3
Write-Host "Installing SQLite3..."
npm install sqlite3 --save

# Run migrations
Write-Host "Running database migrations..."
npx knex migrate:latest

Write-Host "SQLite setup complete!"
