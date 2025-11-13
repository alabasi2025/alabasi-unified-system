# ========================================
# ERROR REPORTER
# Automatic error reporting to GitHub Issues
# ========================================

# ========================================
# ERROR TRACKING
# ========================================

$script:ErrorDatabase = @()
$script:ErrorLogPath = ""

function Initialize-ErrorReporter {
    param([string]$LogPath)
    
    $script:ErrorLogPath = $LogPath
    
    if (!(Test-Path $LogPath)) {
        New-Item -ItemType Directory -Path (Split-Path $LogPath) -Force | Out-Null
    }
}

function Add-ErrorRecord {
    param(
        [string]$Category,
        [string]$Message,
        [string]$Details,
        [string]$Severity = "ERROR"
    )
    
    $errorRecord = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Category = $Category
        Message = $Message
        Details = $Details
        Severity = $Severity
        SystemInfo = Get-SystemInfo
    }
    
    $script:ErrorDatabase += $errorRecord
    
    # Log to file
    if ($script:ErrorLogPath) {
        $logEntry = "[$($errorRecord.Timestamp)] [$Severity] [$Category] $Message"
        Add-Content -Path $script:ErrorLogPath -Value $logEntry
        
        if ($Details) {
            Add-Content -Path $script:ErrorLogPath -Value "  Details: $Details"
        }
    }
    
    return $errorRecord
}

function Get-SystemInfo {
    try {
        $os = Get-CimInstance Win32_OperatingSystem
        $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
        $mem = Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum
        
        return @{
            OS = "$($os.Caption) $($os.Version)"
            Architecture = $os.OSArchitecture
            CPU = $cpu.Name
            Cores = $cpu.NumberOfCores
            RAM = [Math]::Round($mem.Sum / 1GB, 2)
            PowerShell = $PSVersionTable.PSVersion.ToString()
            Hostname = $env:COMPUTERNAME
            Username = $env:USERNAME
        }
    } catch {
        return @{
            OS = "Unknown"
            Error = "Could not retrieve system info"
        }
    }
}

function Format-ErrorReport {
    param(
        [hashtable]$Config,
        [array]$Errors
    )
    
    $report = @"
## Error Report

**Project:** $($Config.project.displayName)  
**Version:** $($Config.project.version)  
**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  

---

### System Information

"@
    
    if ($Errors.Count -gt 0) {
        $sysInfo = $Errors[0].SystemInfo
        $report += @"
- **OS:** $($sysInfo.OS)
- **Architecture:** $($sysInfo.Architecture)
- **CPU:** $($sysInfo.CPU)
- **Cores:** $($sysInfo.Cores)
- **RAM:** $($sysInfo.RAM) GB
- **PowerShell:** $($sysInfo.PowerShell)
- **Hostname:** $($sysInfo.Hostname)

---

### Errors ($($Errors.Count))

"@
    }
    
    foreach ($error in $Errors) {
        $report += @"

#### $($error.Category) - $($error.Severity)

**Time:** $($error.Timestamp)  
**Message:** $($error.Message)  

``````
$($error.Details)
``````

---

"@
    }
    
    # Add logs if available
    if ($script:ErrorLogPath -and (Test-Path $script:ErrorLogPath)) {
        $logContent = Get-Content -Path $script:ErrorLogPath -Tail 50 | Out-String
        $report += @"

### Recent Logs (Last 50 lines)

``````
$logContent
``````

"@
    }
    
    return $report
}

function Submit-GitHubIssue {
    param(
        [hashtable]$Config,
        [string]$Title,
        [string]$Body,
        [array]$Labels = @()
    )
    
    try {
        $repo = $Config.github.repo
        $token = $Config.github.token
        
        if (!$token) {
            Write-Host "  [WARNING] No GitHub token provided, cannot submit issue" -ForegroundColor Yellow
            return $null
        }
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Accept" = "application/vnd.github+json"
            "Content-Type" = "application/json"
        }
        
        # Add configured labels
        if ($Config.errorReporting.labels) {
            $Labels += $Config.errorReporting.labels
        }
        
        $issueData = @{
            title = $Title
            body = $Body
            labels = $Labels
        } | ConvertTo-Json
        
        $url = "https://api.github.com/repos/$repo/issues"
        
        Write-Host "  Submitting issue to GitHub..." -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $issueData -ErrorAction Stop
        
        Write-Host "  [OK] Issue created: #$($response.number)" -ForegroundColor Green
        Write-Host "       URL: $($response.html_url)" -ForegroundColor Gray
        
        return @{
            Number = $response.number
            Url = $response.html_url
            State = $response.state
        }
    } catch {
        Write-Host "  [ERROR] Failed to submit issue: $_" -ForegroundColor Red
        
        # Save report locally
        $reportPath = Join-Path (Split-Path $script:ErrorLogPath) "error-report-$(Get-Date -Format 'yyyyMMddHHmmss').md"
        Set-Content -Path $reportPath -Value $Body
        Write-Host "  [INFO] Error report saved to: $reportPath" -ForegroundColor Yellow
        
        return $null
    }
}

function Report-InstallationError {
    param(
        [hashtable]$Config,
        [array]$Errors
    )
    
    if (!$Config.errorReporting.enabled) {
        Write-Host "  [INFO] Error reporting is disabled" -ForegroundColor Gray
        return
    }
    
    if ($Errors.Count -eq 0) {
        Write-Host "  [INFO] No errors to report" -ForegroundColor Gray
        return
    }
    
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "ERROR REPORTING" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    
    $title = "Installation Error: $($Config.project.displayName) v$($Config.project.version)"
    $body = Format-ErrorReport -Config $Config -Errors $Errors
    
    $labels = @("installation-error", "auto-reported")
    
    # Add severity label
    $criticalErrors = $Errors | Where-Object { $_.Severity -eq "CRITICAL" }
    if ($criticalErrors.Count -gt 0) {
        $labels += "critical"
    }
    
    if ($Config.errorReporting.autoReport) {
        $issue = Submit-GitHubIssue -Config $Config -Title $title -Body $body -Labels $labels
        
        if ($issue) {
            Write-Host "  [OK] Error report submitted successfully" -ForegroundColor Green
            Write-Host "       Issue #$($issue.Number): $($issue.Url)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  [INFO] Auto-reporting is disabled" -ForegroundColor Yellow
        Write-Host "  [INFO] Would you like to submit this error report? (Y/N)" -ForegroundColor Yellow
        
        $response = Read-Host "  "
        
        if ($response -eq "Y" -or $response -eq "y") {
            $issue = Submit-GitHubIssue -Config $Config -Title $title -Body $body -Labels $labels
        } else {
            Write-Host "  [INFO] Error report not submitted" -ForegroundColor Gray
            
            # Save locally
            $reportPath = Join-Path (Split-Path $script:ErrorLogPath) "error-report-$(Get-Date -Format 'yyyyMMddHHmmss').md"
            Set-Content -Path $reportPath -Value $body
            Write-Host "  [INFO] Error report saved to: $reportPath" -ForegroundColor Yellow
        }
    }
}

function Get-IssueSolutions {
    param(
        [hashtable]$Config,
        [int]$IssueNumber
    )
    
    try {
        $repo = $Config.github.repo
        $token = $Config.github.token
        
        $headers = @{
            "Accept" = "application/vnd.github+json"
        }
        
        if ($token) {
            $headers["Authorization"] = "Bearer $token"
        }
        
        $url = "https://api.github.com/repos/$repo/issues/$IssueNumber/comments"
        
        $comments = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -ErrorAction Stop
        
        $solutions = @()
        
        foreach ($comment in $comments) {
            # Look for solution markers
            if ($comment.body -match '(?s)```solution\s*\n(.*?)\n```') {
                $solutions += @{
                    Author = $comment.user.login
                    Date = $comment.created_at
                    Solution = $matches[1]
                    Url = $comment.html_url
                }
            }
        }
        
        return $solutions
    } catch {
        Write-Host "  [WARNING] Could not fetch issue solutions: $_" -ForegroundColor Yellow
        return @()
    }
}

# Export functions
Export-ModuleMember -Function *
