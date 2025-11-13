# ========================================
# AUTO UPDATER
# Automatic update system with rollback
# ========================================

# ========================================
# UPDATE FUNCTIONS
# ========================================

function Check-ForUpdates {
    param(
        [hashtable]$Config
    )
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "CHECKING FOR UPDATES" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $currentVersion = $Config.project.version
    Write-Host "  Current version: $currentVersion" -ForegroundColor White
    
    # Get latest release from GitHub
    $latest = Get-LatestRelease -Repo $Config.github.repo -Token $Config.github.token
    
    if (!$latest) {
        Write-Host "  [WARNING] Could not check for updates" -ForegroundColor Yellow
        return $null
    }
    
    $latestVersion = $latest.Version
    Write-Host "  Latest version: $latestVersion" -ForegroundColor White
    
    $comparison = Compare-Versions -Current $currentVersion -Latest $latestVersion
    
    if ($comparison -eq "newer") {
        Write-Host "`n  [INFO] Update available!" -ForegroundColor Green
        Write-Host "  Release: $($latest.Name)" -ForegroundColor Cyan
        Write-Host "  Published: $($latest.PublishedAt)" -ForegroundColor Gray
        
        if ($latest.Body) {
            Write-Host "`n  Changelog:" -ForegroundColor Cyan
            Write-Host "  $($latest.Body)" -ForegroundColor Gray
        }
        
        return $latest
    } elseif ($comparison -eq "same") {
        Write-Host "`n  [OK] You are running the latest version" -ForegroundColor Green
        return $null
    } else {
        Write-Host "`n  [INFO] You are running a newer version than released" -ForegroundColor Yellow
        return $null
    }
}

function Backup-BeforeUpdate {
    param(
        [hashtable]$Config,
        [string]$BackupPath
    )
    
    Write-Host "`n  Creating backup before update..." -ForegroundColor Cyan
    
    try {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupName = "backup-before-update-$timestamp"
        $fullBackupPath = Join-Path $BackupPath $backupName
        
        if (!(Test-Path $BackupPath)) {
            New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
        }
        
        # Backup project files
        $projectPath = $Config.installation.path
        
        Write-Host "    Backing up files from: $projectPath" -ForegroundColor Yellow
        
        $excludePatterns = $Config.backup.excludePatterns
        
        # Create backup directory
        New-Item -ItemType Directory -Path $fullBackupPath -Force | Out-Null
        
        # Copy files (excluding patterns)
        Get-ChildItem -Path $projectPath -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Substring($projectPath.Length + 1)
            
            $shouldExclude = $false
            foreach ($pattern in $excludePatterns) {
                if ($relativePath -like $pattern) {
                    $shouldExclude = $true
                    break
                }
            }
            
            if (!$shouldExclude) {
                $destPath = Join-Path $fullBackupPath $relativePath
                $destDir = Split-Path $destPath
                
                if (!(Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                }
                
                if ($_.PSIsContainer -eq $false) {
                    Copy-Item -Path $_.FullName -Destination $destPath -Force
                }
            }
        }
        
        # Backup database if enabled
        if ($Config.backup.includeDatabase -and $Config.requirements.database.type -ne "none") {
            Write-Host "    Backing up database..." -ForegroundColor Yellow
            
            $dbBackupPath = Join-Path $fullBackupPath "database-backup.sql"
            
            # Call database backup function (to be implemented in Database-Manager.ps1)
            # Backup-Database -Config $Config -OutputPath $dbBackupPath
        }
        
        # Create backup metadata
        $metadata = @{
            Timestamp = $timestamp
            Version = $Config.project.version
            ProjectName = $Config.project.name
            BackupType = "pre-update"
        } | ConvertTo-Json
        
        Set-Content -Path (Join-Path $fullBackupPath "backup-info.json") -Value $metadata
        
        # Compress backup
        $zipPath = "$fullBackupPath.zip"
        Compress-Archive -Path $fullBackupPath -DestinationPath $zipPath -Force
        
        # Remove uncompressed backup
        Remove-Item -Path $fullBackupPath -Recurse -Force
        
        Write-Host "    [OK] Backup created: $zipPath" -ForegroundColor Green
        
        return $zipPath
    } catch {
        Write-Host "    [ERROR] Backup failed: $_" -ForegroundColor Red
        return $null
    }
}

function Apply-Update {
    param(
        [hashtable]$Config,
        [hashtable]$Release
    )
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "APPLYING UPDATE" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $projectPath = $Config.installation.path
    
    try {
        # Download new version
        $success = Download-Repository `
            -Repo $Config.github.repo `
            -Branch $Release.Version `
            -Token $Config.github.token `
            -Destination $projectPath
        
        if (!$success) {
            throw "Download failed"
        }
        
        # Run update commands
        Write-Host "`n  Running update commands..." -ForegroundColor Cyan
        
        Push-Location $projectPath
        
        try {
            # Install dependencies
            if ($Config.installation.commands.install) {
                Write-Host "    Installing dependencies..." -ForegroundColor Yellow
                Invoke-Expression $Config.installation.commands.install
            }
            
            # Build if needed
            if ($Config.installation.commands.build) {
                Write-Host "    Building project..." -ForegroundColor Yellow
                Invoke-Expression $Config.installation.commands.build
            }
            
            # Database migration if needed
            if ($Config.installation.commands.dbSetup) {
                Write-Host "    Running database migrations..." -ForegroundColor Yellow
                Invoke-Expression $Config.installation.commands.dbSetup
            }
            
            Write-Host "`n  [OK] Update applied successfully" -ForegroundColor Green
            
            # Update version in config
            $Config.project.version = $Release.Version
            
            return $true
        } finally {
            Pop-Location
        }
    } catch {
        Write-Host "`n  [ERROR] Update failed: $_" -ForegroundColor Red
        return $false
    }
}

function Rollback-Update {
    param(
        [hashtable]$Config,
        [string]$BackupPath
    )
    
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "ROLLING BACK UPDATE" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    
    try {
        $projectPath = $Config.installation.path
        
        Write-Host "  Restoring from backup: $BackupPath" -ForegroundColor Yellow
        
        # Extract backup
        $tempRestore = Join-Path $env:TEMP "restore-$(Get-Date -Format 'yyyyMMddHHmmss')"
        Expand-Archive -Path $BackupPath -DestinationPath $tempRestore -Force
        
        # Remove current files
        Get-ChildItem -Path $projectPath -Exclude "*.log" | Remove-Item -Recurse -Force
        
        # Restore files
        Get-ChildItem -Path $tempRestore -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Substring($tempRestore.Length + 1)
            $destPath = Join-Path $projectPath $relativePath
            $destDir = Split-Path $destPath
            
            if (!(Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            
            if ($_.PSIsContainer -eq $false) {
                Copy-Item -Path $_.FullName -Destination $destPath -Force
            }
        }
        
        # Cleanup
        Remove-Item -Path $tempRestore -Recurse -Force
        
        Write-Host "`n  [OK] Rollback completed successfully" -ForegroundColor Green
        
        return $true
    } catch {
        Write-Host "`n  [ERROR] Rollback failed: $_" -ForegroundColor Red
        return $false
    }
}

function Start-AutoUpdate {
    param(
        [hashtable]$Config
    )
    
    if (!$Config.updates.autoInstall) {
        Write-Host "  [INFO] Auto-update is disabled" -ForegroundColor Gray
        return
    }
    
    $update = Check-ForUpdates -Config $Config
    
    if (!$update) {
        return
    }
    
    Write-Host "`n  Auto-update is enabled" -ForegroundColor Cyan
    
    $backupPath = $null
    
    if ($Config.updates.backupBeforeUpdate) {
        $backupPath = Backup-BeforeUpdate -Config $Config -BackupPath $Config.backup.path
        
        if (!$backupPath) {
            Write-Host "  [ERROR] Backup failed, aborting update" -ForegroundColor Red
            return
        }
    }
    
    $success = Apply-Update -Config $Config -Release $update
    
    if (!$success -and $Config.updates.rollbackOnFailure -and $backupPath) {
        Write-Host "`n  Update failed, initiating rollback..." -ForegroundColor Yellow
        Rollback-Update -Config $Config -BackupPath $backupPath
    }
    
    if ($success) {
        Write-Host "`n  [OK] System updated to version $($update.Version)" -ForegroundColor Green
        
        if ($Config.updates.notifyOwner) {
            # Send notification (to be implemented)
            Write-Host "  [INFO] Owner notification sent" -ForegroundColor Gray
        }
    }
}

# Export functions
Export-ModuleMember -Function *
