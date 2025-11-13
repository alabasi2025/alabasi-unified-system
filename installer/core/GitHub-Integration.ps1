# ========================================
# GITHUB INTEGRATION
# Complete GitHub API integration for universal installer
# ========================================

# ========================================
# GITHUB API FUNCTIONS
# ========================================

function Get-GitHubHeaders {
    param([string]$Token)
    
    $headers = @{
        "Accept" = "application/vnd.github+json"
        "User-Agent" = "Manus-Universal-Installer/1.0"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    return $headers
}

function Test-GitHubConnection {
    param(
        [string]$Repo,
        [string]$Token
    )
    
    try {
        $headers = Get-GitHubHeaders -Token $Token
        $url = "https://api.github.com/repos/$Repo"
        
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -ErrorAction Stop
        
        Write-Host "  [OK] GitHub connection successful" -ForegroundColor Green
        Write-Host "       Repository: $($response.full_name)" -ForegroundColor Gray
        Write-Host "       Stars: $($response.stargazers_count) | Forks: $($response.forks_count)" -ForegroundColor Gray
        
        return $true
    } catch {
        Write-Host "  [ERROR] GitHub connection failed: $_" -ForegroundColor Red
        return $false
    }
}

function Get-LatestRelease {
    param(
        [string]$Repo,
        [string]$Token
    )
    
    try {
        $headers = Get-GitHubHeaders -Token $Token
        $url = "https://api.github.com/repos/$Repo/releases/latest"
        
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -ErrorAction Stop
        
        return @{
            Version = $response.tag_name
            Name = $response.name
            Body = $response.body
            PublishedAt = $response.published_at
            ZipballUrl = $response.zipball_url
            TarballUrl = $response.tarball_url
            Assets = $response.assets
        }
    } catch {
        Write-Host "  [WARNING] Could not fetch latest release: $_" -ForegroundColor Yellow
        return $null
    }
}

function Get-AllReleases {
    param(
        [string]$Repo,
        [string]$Token,
        [int]$Limit = 10
    )
    
    try {
        $headers = Get-GitHubHeaders -Token $Token
        $url = "https://api.github.com/repos/$Repo/releases?per_page=$Limit"
        
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -ErrorAction Stop
        
        $releases = @()
        foreach ($release in $response) {
            $releases += @{
                Version = $release.tag_name
                Name = $release.name
                PublishedAt = $release.published_at
                Prerelease = $release.prerelease
                Draft = $release.draft
            }
        }
        
        return $releases
    } catch {
        Write-Host "  [WARNING] Could not fetch releases: $_" -ForegroundColor Yellow
        return @()
    }
}

function Get-RepositoryInfo {
    param(
        [string]$Repo,
        [string]$Token
    )
    
    try {
        $headers = Get-GitHubHeaders -Token $Token
        $url = "https://api.github.com/repos/$Repo"
        
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -ErrorAction Stop
        
        return @{
            Name = $response.name
            FullName = $response.full_name
            Description = $response.description
            Language = $response.language
            Stars = $response.stargazers_count
            Forks = $response.forks_count
            OpenIssues = $response.open_issues_count
            DefaultBranch = $response.default_branch
            CreatedAt = $response.created_at
            UpdatedAt = $response.updated_at
            Size = $response.size
            License = $response.license.name
        }
    } catch {
        Write-Host "  [ERROR] Could not fetch repository info: $_" -ForegroundColor Red
        return $null
    }
}

function Get-LatestCommit {
    param(
        [string]$Repo,
        [string]$Branch,
        [string]$Token
    )
    
    try {
        $headers = Get-GitHubHeaders -Token $Token
        $url = "https://api.github.com/repos/$Repo/commits/$Branch"
        
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -ErrorAction Stop
        
        return @{
            SHA = $response.sha
            Message = $response.commit.message
            Author = $response.commit.author.name
            Date = $response.commit.author.date
            Url = $response.html_url
        }
    } catch {
        Write-Host "  [WARNING] Could not fetch latest commit: $_" -ForegroundColor Yellow
        return $null
    }
}

function Download-Repository {
    param(
        [string]$Repo,
        [string]$Branch,
        [string]$Token,
        [string]$Destination
    )
    
    try {
        Write-Host "  Downloading repository..." -ForegroundColor Cyan
        
        $headers = Get-GitHubHeaders -Token $Token
        $url = "https://api.github.com/repos/$Repo/zipball/$Branch"
        
        $tempZip = Join-Path $env:TEMP "repo-$(Get-Date -Format 'yyyyMMddHHmmss').zip"
        
        Invoke-WebRequest -Uri $url -Headers $headers -OutFile $tempZip -ErrorAction Stop
        
        Write-Host "  [OK] Downloaded to: $tempZip" -ForegroundColor Green
        
        # Extract
        Write-Host "  Extracting..." -ForegroundColor Cyan
        
        if (Test-Path $Destination) {
            Remove-Item -Path $Destination -Recurse -Force
        }
        
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
        
        Expand-Archive -Path $tempZip -DestinationPath $Destination -Force
        
        # Move files from subfolder to root
        $subFolder = Get-ChildItem -Path $Destination -Directory | Select-Object -First 1
        if ($subFolder) {
            Get-ChildItem -Path $subFolder.FullName | Move-Item -Destination $Destination -Force
            Remove-Item -Path $subFolder.FullName -Force
        }
        
        # Cleanup
        Remove-Item -Path $tempZip -Force
        
        Write-Host "  [OK] Repository extracted to: $Destination" -ForegroundColor Green
        
        return $true
    } catch {
        Write-Host "  [ERROR] Download failed: $_" -ForegroundColor Red
        return $false
    }
}

function Compare-Versions {
    param(
        [string]$Current,
        [string]$Latest
    )
    
    # Remove 'v' prefix if present
    $Current = $Current -replace '^v', ''
    $Latest = $Latest -replace '^v', ''
    
    try {
        $currentParts = $Current.Split('.') | ForEach-Object { [int]$_ }
        $latestParts = $Latest.Split('.') | ForEach-Object { [int]$_ }
        
        for ($i = 0; $i -lt [Math]::Max($currentParts.Count, $latestParts.Count); $i++) {
            $c = if ($i -lt $currentParts.Count) { $currentParts[$i] } else { 0 }
            $l = if ($i -lt $latestParts.Count) { $latestParts[$i] } else { 0 }
            
            if ($l -gt $c) {
                return "newer"
            } elseif ($l -lt $c) {
                return "older"
            }
        }
        
        return "same"
    } catch {
        Write-Host "  [WARNING] Version comparison failed, treating as different" -ForegroundColor Yellow
        return "unknown"
    }
}

# Export functions
Export-ModuleMember -Function *
