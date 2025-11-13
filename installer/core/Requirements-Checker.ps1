# ========================================
# REQUIREMENTS CHECKER
# Check and install system requirements
# ========================================

# ========================================
# REQUIREMENT CHECK FUNCTIONS
# ========================================

function Test-NodeJS {
    param([string]$RequiredVersion)
    
    try {
        $node = Get-Command node -ErrorAction Stop
        $version = & node --version
        
        Write-Host "  [OK] Node.js found: $version" -ForegroundColor Green
        Write-Host "       Path: $($node.Source)" -ForegroundColor Gray
        
        return $true
    } catch {
        Write-Host "  [X] Node.js not found" -ForegroundColor Red
        return $false
    }
}

function Test-Python {
    param([string]$RequiredVersion)
    
    try {
        $python = Get-Command python -ErrorAction Stop
        $version = & python --version
        
        Write-Host "  [OK] Python found: $version" -ForegroundColor Green
        Write-Host "       Path: $($python.Source)" -ForegroundColor Gray
        
        return $true
    } catch {
        Write-Host "  [X] Python not found" -ForegroundColor Red
        return $false
    }
}

function Test-Git {
    param([string]$RequiredVersion)
    
    try {
        $git = Get-Command git -ErrorAction Stop
        $version = & git --version
        
        Write-Host "  [OK] Git found: $version" -ForegroundColor Green
        Write-Host "       Path: $($git.Source)" -ForegroundColor Gray
        
        return $true
    } catch {
        Write-Host "  [X] Git not found" -ForegroundColor Red
        return $false
    }
}

function Test-PNPM {
    param([string]$RequiredVersion)
    
    try {
        $pnpm = Get-Command pnpm -ErrorAction Stop
        $version = & pnpm --version
        
        Write-Host "  [OK] pnpm found: v$version" -ForegroundColor Green
        Write-Host "       Path: $($pnpm.Source)" -ForegroundColor Gray
        
        return $true
    } catch {
        Write-Host "  [X] pnpm not found" -ForegroundColor Red
        return $false
    }
}

function Install-PNPM {
    Write-Host "`n  Installing pnpm..." -ForegroundColor Cyan
    
    try {
        & npm install -g pnpm
        
        Write-Host "  [OK] pnpm installed successfully" -ForegroundColor Green
        
        return $true
    } catch {
        Write-Host "  [ERROR] pnpm installation failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-MySQL {
    try {
        $mysql = Get-Command mysql -ErrorAction Stop
        $version = & mysql --version
        
        Write-Host "  [OK] MySQL client found: $version" -ForegroundColor Green
        Write-Host "       Path: $($mysql.Source)" -ForegroundColor Gray
        
        # Test service
        $service = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue | Select-Object -First 1
        
        if ($service) {
            if ($service.Status -eq "Running") {
                Write-Host "  [OK] MySQL service is running" -ForegroundColor Green
            } else {
                Write-Host "  [WARNING] MySQL service is not running" -ForegroundColor Yellow
                Write-Host "            Starting service..." -ForegroundColor Yellow
                
                Start-Service -Name $service.Name
                
                Write-Host "  [OK] MySQL service started" -ForegroundColor Green
            }
            
            return $true
        } else {
            Write-Host "  [WARNING] MySQL service not found" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "  [X] MySQL not found" -ForegroundColor Red
        return $false
    }
}

function Test-PostgreSQL {
    try {
        $psql = Get-Command psql -ErrorAction Stop
        $version = & psql --version
        
        Write-Host "  [OK] PostgreSQL found: $version" -ForegroundColor Green
        
        # Test service
        $service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
        
        if ($service -and $service.Status -eq "Running") {
            Write-Host "  [OK] PostgreSQL service is running" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [WARNING] PostgreSQL service not running" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "  [X] PostgreSQL not found" -ForegroundColor Red
        return $false
    }
}

function Test-MSSQL {
    try {
        $service = Get-Service -Name "MSSQLSERVER" -ErrorAction Stop
        
        if ($service.Status -eq "Running") {
            Write-Host "  [OK] SQL Server is running" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [WARNING] SQL Server is not running" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "  [X] SQL Server not found" -ForegroundColor Red
        return $false
    }
}

function Test-DiskSpace {
    param(
        [long]$MinimumBytes,
        [string]$Path
    )
    
    try {
        $drive = (Get-Item $Path).PSDrive.Name + ":"
        $disk = Get-PSDrive -Name $drive[0]
        
        $freeGB = [Math]::Round($disk.Free / 1GB, 2)
        $requiredGB = [Math]::Round($MinimumBytes / 1GB, 2)
        
        if ($disk.Free -ge $MinimumBytes) {
            Write-Host "  [OK] Disk space: $freeGB GB available (required: $requiredGB GB)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [X] Insufficient disk space: $freeGB GB available (required: $requiredGB GB)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  [WARNING] Could not check disk space: $_" -ForegroundColor Yellow
        return $true
    }
}

function Check-AllRequirements {
    param([hashtable]$Config)
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "CHECKING REQUIREMENTS" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $results = @{
        AllMet = $true
        Details = @{}
    }
    
    # Check Node.js
    if ($Config.requirements.node) {
        Write-Host "Checking Node.js..." -ForegroundColor Cyan
        $results.Details.Node = Test-NodeJS -RequiredVersion $Config.requirements.node.version
        if (!$results.Details.Node) { $results.AllMet = $false }
    }
    
    # Check Python
    if ($Config.requirements.python) {
        Write-Host "`nChecking Python..." -ForegroundColor Cyan
        $results.Details.Python = Test-Python -RequiredVersion $Config.requirements.python.version
        if (!$results.Details.Python) { $results.AllMet = $false }
    }
    
    # Check Git
    if ($Config.requirements.git) {
        Write-Host "`nChecking Git..." -ForegroundColor Cyan
        $results.Details.Git = Test-Git -RequiredVersion $Config.requirements.git.version
        if (!$results.Details.Git) { $results.AllMet = $false }
    }
    
    # Check pnpm
    if ($Config.requirements.pnpm) {
        Write-Host "`nChecking pnpm..." -ForegroundColor Cyan
        $results.Details.PNPM = Test-PNPM -RequiredVersion $Config.requirements.pnpm.version
        
        if (!$results.Details.PNPM) {
            Write-Host "  Attempting to install pnpm..." -ForegroundColor Yellow
            $results.Details.PNPM = Install-PNPM
        }
        
        if (!$results.Details.PNPM) { $results.AllMet = $false }
    }
    
    # Check Database
    if ($Config.requirements.database -and $Config.requirements.database.type -ne "none") {
        Write-Host "`nChecking Database ($($Config.requirements.database.type))..." -ForegroundColor Cyan
        
        switch ($Config.requirements.database.type) {
            "mysql" {
                $results.Details.Database = Test-MySQL
            }
            "postgresql" {
                $results.Details.Database = Test-PostgreSQL
            }
            "mssql" {
                $results.Details.Database = Test-MSSQL
            }
            default {
                Write-Host "  [WARNING] Unknown database type: $($Config.requirements.database.type)" -ForegroundColor Yellow
                $results.Details.Database = $false
            }
        }
        
        if (!$results.Details.Database -and $Config.requirements.database.required) {
            $results.AllMet = $false
        }
    }
    
    # Check NSSM
    if ($Config.requirements.nssm -and $Config.service.enabled) {
        Write-Host "`nChecking NSSM..." -ForegroundColor Cyan
        $results.Details.NSSM = Test-NSSMInstalled
        
        # NSSM will be installed later if needed
    }
    
    # Check disk space
    if ($Config.requirements.diskSpace) {
        Write-Host "`nChecking Disk Space..." -ForegroundColor Cyan
        $results.Details.DiskSpace = Test-DiskSpace `
            -MinimumBytes $Config.requirements.diskSpace.minimum `
            -Path $Config.installation.path
        
        if (!$results.Details.DiskSpace) { $results.AllMet = $false }
    }
    
    # Check custom requirements
    if ($Config.requirements.custom) {
        Write-Host "`nChecking Custom Requirements..." -ForegroundColor Cyan
        
        foreach ($custom in $Config.requirements.custom) {
            Write-Host "  Checking: $($custom.name)..." -ForegroundColor Yellow
            
            try {
                $checkResult = Invoke-Expression $custom.check
                
                if ($checkResult) {
                    Write-Host "  [OK] $($custom.name) found" -ForegroundColor Green
                    $results.Details[$custom.name] = $true
                } else {
                    Write-Host "  [X] $($custom.name) not found" -ForegroundColor Red
                    $results.Details[$custom.name] = $false
                    
                    if ($custom.required) {
                        $results.AllMet = $false
                    }
                }
            } catch {
                Write-Host "  [ERROR] Check failed: $_" -ForegroundColor Red
                $results.Details[$custom.name] = $false
                
                if ($custom.required) {
                    $results.AllMet = $false
                }
            }
        }
    }
    
    # Summary
    Write-Host "`n========================================" -ForegroundColor Cyan
    if ($results.AllMet) {
        Write-Host "ALL REQUIREMENTS MET" -ForegroundColor Green
    } else {
        Write-Host "SOME REQUIREMENTS NOT MET" -ForegroundColor Red
    }
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    return $results
}

# Export functions
Export-ModuleMember -Function *
