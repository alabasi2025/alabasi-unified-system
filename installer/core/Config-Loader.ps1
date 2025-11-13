# ============================================
# Config-Loader.ps1
# محمل التكوينات - Manos-DevCore v2.0
# ============================================

<#
.SYNOPSIS
    محمل التكوينات الشامل للنظام

.DESCRIPTION
    يقوم بتحميل وإدارة التكوينات من مصادر متعددة:
    - ملفات JSON
    - متغيرات البيئة
    - سطر الأوامر
    - التكوينات الافتراضية

.PARAMETER ConfigPath
    مسار ملف التكوين

.PARAMETER ProjectName
    اسم المشروع

.PARAMETER MergeWithDefaults
    دمج مع التكوينات الافتراضية

.PARAMETER Validate
    التحقق من صحة التكوين

.EXAMPLE
    Load-ProjectConfig -ConfigPath ".\config.json"

.EXAMPLE
    Load-ProjectConfig -ProjectName "my-project" -MergeWithDefaults

.EXAMPLE
    Get-ConfigValue -Key "database.connectionString"
#>

# ============================================
# المتغيرات العامة
# ============================================

$Script:RootPath = Split-Path -Parent $PSScriptRoot
$Script:ConfigPath = Join-Path $RootPath "Config"
$Script:ProjectsPath = Join-Path $RootPath "Projects"
$Script:LoadedConfigs = @{}
$Script:ConfigCache = @{}

# ============================================
# الدوال الأساسية
# ============================================

function Load-ProjectConfig {
    <#
    .SYNOPSIS
        تحميل تكوين مشروع

    .PARAMETER ConfigPath
        مسار ملف التكوين

    .PARAMETER ProjectName
        اسم المشروع

    .PARAMETER MergeWithDefaults
        دمج مع التكوينات الافتراضية
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$ConfigPath,

        [Parameter(Mandatory=$false)]
        [string]$ProjectName,

        [Parameter(Mandatory=$false)]
        [switch]$MergeWithDefaults,

        [Parameter(Mandatory=$false)]
        [switch]$UseCache
    )

    try {
        # تحديد مسار التكوين
        if (-not $ConfigPath) {
            if ($ProjectName) {
                $ConfigPath = Join-Path $Script:ProjectsPath "$ProjectName\install.config.json"
            }
            else {
                $ConfigPath = Join-Path $Script:ConfigPath "install.config.json"
            }
        }

        # التحقق من الكاش
        if ($UseCache -and $Script:ConfigCache.ContainsKey($ConfigPath)) {
            Write-Verbose "تحميل من الكاش: $ConfigPath"
            return $Script:ConfigCache[$ConfigPath]
        }

        # التحقق من وجود الملف
        if (-not (Test-Path $ConfigPath)) {
            Write-Warning "ملف التكوين غير موجود: $ConfigPath"
            
            if ($MergeWithDefaults) {
                return Get-DefaultConfig
            }
            
            return $null
        }

        # قراءة الملف
        $configContent = Get-Content $ConfigPath -Raw -Encoding UTF8
        $config = $configContent | ConvertFrom-Json

        # دمج مع الافتراضي
        if ($MergeWithDefaults) {
            $defaultConfig = Get-DefaultConfig
            $config = Merge-Configs -Base $defaultConfig -Override $config
        }

        # حفظ في الكاش
        $Script:ConfigCache[$ConfigPath] = $config
        $Script:LoadedConfigs[$ConfigPath] = @{
            Config = $config
            LoadTime = Get-Date
            Path = $ConfigPath
        }

        Write-Verbose "تم تحميل التكوين: $ConfigPath"
        return $config
    }
    catch {
        Write-Error "فشل تحميل التكوين: $_"
        return $null
    }
}

function Get-DefaultConfig {
    <#
    .SYNOPSIS
        الحصول على التكوين الافتراضي
    #>
    
    return [PSCustomObject]@{
        version = "2.0.0"
        project = @{
            name = ""
            version = "1.0.0"
            description = ""
        }
        installation = @{
            mode = "Install"
            skipRequirements = $false
            createBackup = $true
            rollbackOnError = $true
        }
        paths = @{
            root = $Script:RootPath
            core = Join-Path $Script:RootPath "Core"
            logs = Join-Path $Script:RootPath "Logs"
            backups = Join-Path $Script:RootPath "Backups"
        }
        features = @{
            enabled = @()
            disabled = @()
        }
        database = @{
            type = "SQLite"
            connectionString = ""
            autoMigrate = $true
        }
        logging = @{
            level = "Info"
            console = $true
            file = $true
            maxSize = "10MB"
        }
        notifications = @{
            email = $false
            slack = $false
            whatsapp = $false
        }
    }
}

function Merge-Configs {
    <#
    .SYNOPSIS
        دمج تكوينين

    .PARAMETER Base
        التكوين الأساسي

    .PARAMETER Override
        التكوين المراد دمجه
    #>
    param(
        [Parameter(Mandatory=$true)]
        $Base,

        [Parameter(Mandatory=$true)]
        $Override
    )

    $merged = $Base.PSObject.Copy()

    foreach ($property in $Override.PSObject.Properties) {
        $name = $property.Name
        $value = $property.Value

        if ($merged.PSObject.Properties[$name]) {
            if ($value -is [PSCustomObject] -and $merged.$name -is [PSCustomObject]) {
                # دمج متداخل
                $merged.$name = Merge-Configs -Base $merged.$name -Override $value
            }
            else {
                # استبدال القيمة
                $merged.$name = $value
            }
        }
        else {
            # إضافة خاصية جديدة
            $merged | Add-Member -MemberType NoteProperty -Name $name -Value $value -Force
        }
    }

    return $merged
}

function Get-ConfigValue {
    <#
    .SYNOPSIS
        الحصول على قيمة من التكوين

    .PARAMETER Key
        مفتاح القيمة (يدعم النقطة للوصول المتداخل)

    .PARAMETER Config
        كائن التكوين

    .PARAMETER DefaultValue
        القيمة الافتراضية إذا لم يتم العثور على المفتاح

    .EXAMPLE
        Get-ConfigValue -Key "database.connectionString" -Config $config
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Key,

        [Parameter(Mandatory=$false)]
        $Config,

        [Parameter(Mandatory=$false)]
        $DefaultValue = $null
    )

    if (-not $Config) {
        $Config = $Script:LoadedConfigs.Values | Select-Object -First 1 -ExpandProperty Config
    }

    if (-not $Config) {
        return $DefaultValue
    }

    $keys = $Key -split '\.'
    $current = $Config

    foreach ($k in $keys) {
        if ($current.PSObject.Properties[$k]) {
            $current = $current.$k
        }
        else {
            return $DefaultValue
        }
    }

    return $current
}

function Set-ConfigValue {
    <#
    .SYNOPSIS
        تعيين قيمة في التكوين

    .PARAMETER Key
        مفتاح القيمة

    .PARAMETER Value
        القيمة الجديدة

    .PARAMETER Config
        كائن التكوين
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Key,

        [Parameter(Mandatory=$true)]
        $Value,

        [Parameter(Mandatory=$false)]
        $Config
    )

    if (-not $Config) {
        $Config = $Script:LoadedConfigs.Values | Select-Object -First 1 -ExpandProperty Config
    }

    $keys = $Key -split '\.'
    $current = $Config

    for ($i = 0; $i -lt $keys.Count - 1; $i++) {
        $k = $keys[$i]
        
        if (-not $current.PSObject.Properties[$k]) {
            $current | Add-Member -MemberType NoteProperty -Name $k -Value ([PSCustomObject]@{})
        }
        
        $current = $current.$k
    }

    $lastKey = $keys[-1]
    
    if ($current.PSObject.Properties[$lastKey]) {
        $current.$lastKey = $Value
    }
    else {
        $current | Add-Member -MemberType NoteProperty -Name $lastKey -Value $Value
    }
}

function Test-ConfigValid {
    <#
    .SYNOPSIS
        التحقق من صحة التكوين

    .PARAMETER Config
        كائن التكوين

    .PARAMETER Schema
        مخطط التحقق (اختياري)
    #>
    param(
        [Parameter(Mandatory=$true)]
        $Config,

        [Parameter(Mandatory=$false)]
        $Schema
    )

    try {
        # فحوصات أساسية
        if (-not $Config) {
            Write-Error "التكوين فارغ"
            return $false
        }

        # فحص الإصدار
        if (-not $Config.version) {
            Write-Warning "لا يوجد إصدار في التكوين"
        }

        # فحص المسارات
        if ($Config.paths) {
            foreach ($pathProperty in $Config.paths.PSObject.Properties) {
                $path = $pathProperty.Value
                
                if ($path -and -not (Test-Path $path)) {
                    Write-Warning "المسار غير موجود: $($pathProperty.Name) = $path"
                }
            }
        }

        # فحص حسب المخطط
        if ($Schema) {
            # TODO: تنفيذ التحقق حسب المخطط
        }

        return $true
    }
    catch {
        Write-Error "فشل التحقق من التكوين: $_"
        return $false
    }
}

function Save-Config {
    <#
    .SYNOPSIS
        حفظ التكوين إلى ملف

    .PARAMETER Config
        كائن التكوين

    .PARAMETER Path
        مسار الملف

    .PARAMETER Backup
        إنشاء نسخة احتياطية
    #>
    param(
        [Parameter(Mandatory=$true)]
        $Config,

        [Parameter(Mandatory=$true)]
        [string]$Path,

        [Parameter(Mandatory=$false)]
        [switch]$Backup
    )

    try {
        # إنشاء نسخة احتياطية
        if ($Backup -and (Test-Path $Path)) {
            $backupPath = "$Path.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            Copy-Item $Path $backupPath -Force
            Write-Verbose "تم إنشاء نسخة احتياطية: $backupPath"
        }

        # حفظ التكوين
        $json = $Config | ConvertTo-Json -Depth 10
        $json | Out-File -FilePath $Path -Encoding UTF8 -Force

        Write-Verbose "تم حفظ التكوين: $Path"
        return $true
    }
    catch {
        Write-Error "فشل حفظ التكوين: $_"
        return $false
    }
}

function Import-ConfigFromEnv {
    <#
    .SYNOPSIS
        استيراد التكوين من متغيرات البيئة

    .PARAMETER Prefix
        بادئة متغيرات البيئة (افتراضي: MANOS_)
    #>
    param(
        [Parameter(Mandatory=$false)]
        [string]$Prefix = "MANOS_"
    )

    $config = [PSCustomObject]@{}

    Get-ChildItem Env: | Where-Object { $_.Name -like "$Prefix*" } | ForEach-Object {
        $key = $_.Name.Substring($Prefix.Length).Replace('__', '.')
        $value = $_.Value

        Set-ConfigValue -Key $key -Value $value -Config $config
    }

    return $config
}

function Export-ConfigToEnv {
    <#
    .SYNOPSIS
        تصدير التكوين إلى متغيرات البيئة

    .PARAMETER Config
        كائن التكوين

    .PARAMETER Prefix
        بادئة متغيرات البيئة
    #>
    param(
        [Parameter(Mandatory=$true)]
        $Config,

        [Parameter(Mandatory=$false)]
        [string]$Prefix = "MANOS_"
    )

    function Flatten-Config {
        param($Object, $Prefix = "")

        foreach ($property in $Object.PSObject.Properties) {
            $name = $property.Name
            $value = $property.Value
            $fullName = if ($Prefix) { "$Prefix.$name" } else { $name }

            if ($value -is [PSCustomObject]) {
                Flatten-Config -Object $value -Prefix $fullName
            }
            else {
                $envName = "$Prefix$($fullName.Replace('.', '__').ToUpper())"
                [Environment]::SetEnvironmentVariable($envName, $value, "Process")
                Write-Verbose "تم تعيين: $envName = $value"
            }
        }
    }

    Flatten-Config -Object $Config
}

function Clear-ConfigCache {
    <#
    .SYNOPSIS
        مسح كاش التكوينات
    #>
    
    $Script:ConfigCache.Clear()
    $Script:LoadedConfigs.Clear()
    Write-Verbose "تم مسح كاش التكوينات"
}

function Get-LoadedConfigs {
    <#
    .SYNOPSIS
        الحصول على قائمة التكوينات المحملة
    #>
    
    return $Script:LoadedConfigs
}

# ============================================
# التصدير
# ============================================

Export-ModuleMember -Function @(
    'Load-ProjectConfig',
    'Get-DefaultConfig',
    'Merge-Configs',
    'Get-ConfigValue',
    'Set-ConfigValue',
    'Test-ConfigValid',
    'Save-Config',
    'Import-ConfigFromEnv',
    'Export-ConfigToEnv',
    'Clear-ConfigCache',
    'Get-LoadedConfigs'
)

Write-Verbose "تم تحميل Config-Loader v2.0"
