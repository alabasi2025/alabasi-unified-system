# ========================================
# SERVICE MANAGER
# Windows service management using NSSM
# ========================================

# ========================================
# NSSM FUNCTIONS
# ========================================

function Test-NSSMInstalled {
    try {
        $nssm = Get-Command nssm.exe -ErrorAction Stop
        Write-Host "  [OK] NSSM found: $($nssm.Source)" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  [WARNING] NSSM not found in PATH" -ForegroundColor Yellow
        return $false
    }
}

function Install-NSSM {
    param([string]$DownloadUrl)
    
    Write-Host "`n  Installing NSSM..." -ForegroundColor Cyan
    
    try {
        $tempZip = Join-Path $env:TEMP "nssm.zip"
        $tempExtract = Join-Path $env:TEMP "nssm-extract"
        
        # Download
        Write-Host "    Downloading from: $DownloadUrl" -ForegroundColor Yellow
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $tempZip -ErrorAction Stop
        
        # Extract
        Write-Host "    Extracting..." -ForegroundColor Yellow
        Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
        
        # Find nssm.exe
        $nssmExe = Get-ChildItem -Path $tempExtract -Filter "nssm.exe" -Recurse | Where-Object { $_.Directory.Name -eq "win64" } | Select-Object -First 1
        
        if (!$nssmExe) {
            throw "nssm.exe not found in archive"
        }
        
        # Copy to System32
        $destination = Join-Path $env:SystemRoot "System32\nssm.exe"
        Copy-Item -Path $nssmExe.FullName -Destination $destination -Force
        
        # Cleanup
        Remove-Item -Path $tempZip -Force
        Remove-Item -Path $tempExtract -Recurse -Force
        
        Write-Host "    [OK] NSSM installed to: $destination" -ForegroundColor Green
        
        return $true
    } catch {
        Write-Host "    [ERROR] NSSM installation failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-ServiceExists {
    param([string]$ServiceName)
    
    try {
        $service = Get-Service -Name $ServiceName -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Install-WindowsService {
    param(
        [hashtable]$Config
    )
    
    if (!$Config.service.enabled) {
        Write-Host "  [INFO] Service installation is disabled" -ForegroundColor Gray
        return $true
    }
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "INSTALLING WINDOWS SERVICE" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $serviceName = $Config.service.name
    $displayName = $Config.service.displayName
    $description = $Config.service.description
    $executable = $Config.service.executable
    $arguments = $Config.service.arguments
    $workingDir = $Config.service.workingDirectory
    
    Write-Host "  Service Name: $serviceName" -ForegroundColor White
    Write-Host "  Display Name: $displayName" -ForegroundColor White
    Write-Host "  Executable: $executable $arguments" -ForegroundColor White
    Write-Host "  Working Directory: $workingDir" -ForegroundColor White
    
    # Check if NSSM is installed
    if (!(Test-NSSMInstalled)) {
        Write-Host "`n  NSSM is required for service installation" -ForegroundColor Yellow
        
        $nssmUrl = $Config.requirements.nssm.downloadUrl
        
        if (!$nssmUrl) {
            Write-Host "  [ERROR] NSSM download URL not configured" -ForegroundColor Red
            return $false
        }
        
        $installed = Install-NSSM -DownloadUrl $nssmUrl
        
        if (!$installed) {
            return $false
        }
    }
    
    # Check if service already exists
    if (Test-ServiceExists -ServiceName $serviceName) {
        Write-Host "`n  Service already exists, removing..." -ForegroundColor Yellow
        
        try {
            # Stop service
            Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            
            # Remove service
            & nssm remove $serviceName confirm
            
            Write-Host "  [OK] Existing service removed" -ForegroundColor Green
        } catch {
            Write-Host "  [ERROR] Failed to remove existing service: $_" -ForegroundColor Red
            return $false
        }
    }
    
    # Install service
    Write-Host "`n  Installing service..." -ForegroundColor Cyan
    
    try {
        # Find executable full path
        $exePath = (Get-Command $executable -ErrorAction Stop).Source
        
        # Install service
        & nssm install $serviceName $exePath $arguments
        
        # Configure service
        & nssm set $serviceName DisplayName $displayName
        & nssm set $serviceName Description $description
        & nssm set $serviceName AppDirectory $workingDir
        & nssm set $serviceName Start SERVICE_$($Config.service.startMode.ToUpper())_START
        
        # Set failure actions if configured
        if ($Config.service.failureActions) {
            $actions = $Config.service.failureActions
            
            & nssm set $serviceName AppThrottle $actions.restartDelay
            & nssm set $serviceName AppExit Default Restart
        }
        
        # Set dependencies if configured
        if ($Config.service.dependencies -and $Config.service.dependencies.Count -gt 0) {
            $deps = $Config.service.dependencies -join " "
            & nssm set $serviceName DependOnService $deps
        }
        
        # Set log files
        $logDir = Join-Path $Config.monitoring.logs.path "service"
        if (!(Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        
        & nssm set $serviceName AppStdout (Join-Path $logDir "stdout.log")
        & nssm set $serviceName AppStderr (Join-Path $logDir "stderr.log")
        
        Write-Host "  [OK] Service installed successfully" -ForegroundColor Green
        
        return $true
    } catch {
        Write-Host "  [ERROR] Service installation failed: $_" -ForegroundColor Red
        return $false
    }
}

function Start-ProjectService {
    param([hashtable]$Config)
    
    if (!$Config.service.enabled) {
        Write-Host "  [INFO] Service is not enabled" -ForegroundColor Gray
        return $true
    }
    
    $serviceName = $Config.service.name
    
    Write-Host "`n  Starting service: $serviceName..." -ForegroundColor Cyan
    
    try {
        Start-Service -Name $serviceName -ErrorAction Stop
        
        Start-Sleep -Seconds 3
        
        $service = Get-Service -Name $serviceName
        
        if ($service.Status -eq "Running") {
            Write-Host "  [OK] Service started successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [ERROR] Service failed to start (Status: $($service.Status))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  [ERROR] Failed to start service: $_" -ForegroundColor Red
        return $false
    }
}

function Stop-ProjectService {
    param([hashtable]$Config)
    
    if (!$Config.service.enabled) {
        return $true
    }
    
    $serviceName = $Config.service.name
    
    Write-Host "`n  Stopping service: $serviceName..." -ForegroundColor Cyan
    
    try {
        Stop-Service -Name $serviceName -Force -ErrorAction Stop
        
        Write-Host "  [OK] Service stopped" -ForegroundColor Green
        
        return $true
    } catch {
        Write-Host "  [WARNING] Failed to stop service: $_" -ForegroundColor Yellow
        return $false
    }
}

function Get-ServiceStatus {
    param([hashtable]$Config)
    
    if (!$Config.service.enabled) {
        return @{
            Enabled = $false
            Status = "Not configured"
        }
    }
    
    $serviceName = $Config.service.name
    
    try {
        $service = Get-Service -Name $serviceName -ErrorAction Stop
        
        return @{
            Enabled = $true
            Name = $service.Name
            DisplayName = $service.DisplayName
            Status = $service.Status.ToString()
            StartType = $service.StartType.ToString()
        }
    } catch {
        return @{
            Enabled = $true
            Status = "Not installed"
        }
    }
}

function Remove-WindowsService {
    param([hashtable]$Config)
    
    if (!$Config.service.enabled) {
        return $true
    }
    
    $serviceName = $Config.service.name
    
    Write-Host "`n  Removing service: $serviceName..." -ForegroundColor Cyan
    
    try {
        # Stop service
        Stop-ProjectService -Config $Config
        
        # Remove service
        & nssm remove $serviceName confirm
        
        Write-Host "  [OK] Service removed" -ForegroundColor Green
        
        return $true
    } catch {
        Write-Host "  [ERROR] Failed to remove service: $_" -ForegroundColor Red
        return $false
    }
}

# Export functions
Export-ModuleMember -Function *
