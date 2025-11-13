# ========================================
# DATABASE MANAGER
# Database setup and management
# ========================================

# ========================================
# DATABASE FUNCTIONS
# ========================================

function Setup-MySQL {
    param(
        [hashtable]$Config,
        [string]$Password
    )
    
    Write-Host "`n  Setting up MySQL database..." -ForegroundColor Cyan
    
    try {
        $dbName = $Config.requirements.database.name
        $host = $Config.requirements.database.host
        $port = $Config.requirements.database.port
        $user = $Config.requirements.database.user
        
        Write-Host "    Database: $dbName" -ForegroundColor Yellow
        Write-Host "    Host: $host:$port" -ForegroundColor Yellow
        Write-Host "    User: $user" -ForegroundColor Yellow
        
        # Create database
        $createCmd = "CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        
        if ($Password) {
            & mysql -h $host -P $port -u $user -p$Password -e $createCmd 2>&1 | Out-Null
        } else {
            & mysql -h $host -P $port -u $user -e $createCmd 2>&1 | Out-Null
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    [OK] Database created/verified" -ForegroundColor Green
            return $true
        } else {
            Write-Host "    [ERROR] Database creation failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "    [ERROR] MySQL setup failed: $_" -ForegroundColor Red
        return $false
    }
}

function Setup-PostgreSQL {
    param(
        [hashtable]$Config,
        [string]$Password
    )
    
    Write-Host "`n  Setting up PostgreSQL database..." -ForegroundColor Cyan
    
    try {
        $dbName = $Config.requirements.database.name
        $host = $Config.requirements.database.host
        $port = $Config.requirements.database.port
        $user = $Config.requirements.database.user
        
        # Set password environment variable
        if ($Password) {
            $env:PGPASSWORD = $Password
        }
        
        # Check if database exists
        $checkCmd = "SELECT 1 FROM pg_database WHERE datname='$dbName'"
        $result = & psql -h $host -p $port -U $user -d postgres -t -c $checkCmd 2>&1
        
        if ($result -notmatch "1") {
            # Create database
            & psql -h $host -p $port -U $user -d postgres -c "CREATE DATABASE $dbName ENCODING 'UTF8';" 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    [OK] Database created" -ForegroundColor Green
            } else {
                Write-Host "    [ERROR] Database creation failed" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "    [OK] Database already exists" -ForegroundColor Green
        }
        
        # Clear password
        $env:PGPASSWORD = $null
        
        return $true
    } catch {
        Write-Host "    [ERROR] PostgreSQL setup failed: $_" -ForegroundColor Red
        $env:PGPASSWORD = $null
        return $false
    }
}

function Setup-MSSQL {
    param(
        [hashtable]$Config,
        [string]$Password
    )
    
    Write-Host "`n  Setting up SQL Server database..." -ForegroundColor Cyan
    
    try {
        $dbName = $Config.requirements.database.name
        $server = $Config.requirements.database.host
        $user = $Config.requirements.database.user
        
        # Build connection string
        if ($Password) {
            $connStr = "Server=$server;User Id=$user;Password=$Password;"
        } else {
            $connStr = "Server=$server;Integrated Security=True;"
        }
        
        # Create database using sqlcmd
        $createCmd = "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'$dbName') CREATE DATABASE [$dbName];"
        
        & sqlcmd -S $server -U $user -P $Password -Q $createCmd 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    [OK] Database created/verified" -ForegroundColor Green
            return $true
        } else {
            Write-Host "    [ERROR] Database creation failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "    [ERROR] SQL Server setup failed: $_" -ForegroundColor Red
        return $false
    }
}

function Build-ConnectionString {
    param(
        [hashtable]$Config,
        [string]$Password
    )
    
    $dbType = $Config.requirements.database.type
    $host = $Config.requirements.database.host
    $port = $Config.requirements.database.port
    $dbName = $Config.requirements.database.name
    $user = $Config.requirements.database.user
    
    switch ($dbType) {
        "mysql" {
            if ($Password) {
                return "mysql://${user}:${Password}@${host}:${port}/${dbName}"
            } else {
                return "mysql://${user}@${host}:${port}/${dbName}"
            }
        }
        "postgresql" {
            if ($Password) {
                return "postgresql://${user}:${Password}@${host}:${port}/${dbName}"
            } else {
                return "postgresql://${user}@${host}:${port}/${dbName}"
            }
        }
        "mssql" {
            if ($Password) {
                return "mssql://${user}:${Password}@${host}:${port}/${dbName}"
            } else {
                return "mssql://${host}:${port}/${dbName}?integratedSecurity=true"
            }
        }
        default {
            return ""
        }
    }
}

function Setup-Database {
    param(
        [hashtable]$Config,
        [string]$Password
    )
    
    if ($Config.requirements.database.type -eq "none") {
        Write-Host "  [INFO] No database required" -ForegroundColor Gray
        return $true
    }
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "DATABASE SETUP" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $dbType = $Config.requirements.database.type
    
    $success = switch ($dbType) {
        "mysql" {
            Setup-MySQL -Config $Config -Password $Password
        }
        "postgresql" {
            Setup-PostgreSQL -Config $Config -Password $Password
        }
        "mssql" {
            Setup-MSSQL -Config $Config -Password $Password
        }
        default {
            Write-Host "  [ERROR] Unknown database type: $dbType" -ForegroundColor Red
            $false
        }
    }
    
    if ($success) {
        # Build connection string
        $connStr = Build-ConnectionString -Config $Config -Password $Password
        
        # Update config
        $Config.requirements.database.connectionString = $connStr
        
        Write-Host "`n  [OK] Database setup completed" -ForegroundColor Green
    }
    
    return $success
}

function Run-DatabaseMigrations {
    param(
        [hashtable]$Config
    )
    
    if (!$Config.installation.commands.dbSetup) {
        Write-Host "  [INFO] No database migrations configured" -ForegroundColor Gray
        return $true
    }
    
    Write-Host "`n  Running database migrations..." -ForegroundColor Cyan
    
    try {
        Push-Location $Config.installation.path
        
        try {
            Invoke-Expression $Config.installation.commands.dbSetup
            
            Write-Host "  [OK] Migrations completed" -ForegroundColor Green
            
            return $true
        } finally {
            Pop-Location
        }
    } catch {
        Write-Host "  [ERROR] Migrations failed: $_" -ForegroundColor Red
        return $false
    }
}

function Backup-Database {
    param(
        [hashtable]$Config,
        [string]$OutputPath,
        [string]$Password
    )
    
    if ($Config.requirements.database.type -eq "none") {
        return $true
    }
    
    Write-Host "  Backing up database..." -ForegroundColor Cyan
    
    $dbType = $Config.requirements.database.type
    $dbName = $Config.requirements.database.name
    $host = $Config.requirements.database.host
    $port = $Config.requirements.database.port
    $user = $Config.requirements.database.user
    
    try {
        switch ($dbType) {
            "mysql" {
                if ($Password) {
                    & mysqldump -h $host -P $port -u $user -p$Password $dbName > $OutputPath 2>&1
                } else {
                    & mysqldump -h $host -P $port -u $user $dbName > $OutputPath 2>&1
                }
            }
            "postgresql" {
                if ($Password) {
                    $env:PGPASSWORD = $Password
                }
                
                & pg_dump -h $host -p $port -U $user -d $dbName -f $OutputPath 2>&1
                
                $env:PGPASSWORD = $null
            }
            "mssql" {
                $backupCmd = "BACKUP DATABASE [$dbName] TO DISK = N'$OutputPath' WITH FORMAT;"
                & sqlcmd -S $host -U $user -P $Password -Q $backupCmd 2>&1
            }
        }
        
        if ($LASTEXITCODE -eq 0 -and (Test-Path $OutputPath)) {
            Write-Host "  [OK] Database backup created: $OutputPath" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [ERROR] Database backup failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  [ERROR] Database backup failed: $_" -ForegroundColor Red
        return $false
    }
}

# Export functions
Export-ModuleMember -Function *
