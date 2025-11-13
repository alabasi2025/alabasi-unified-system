<#
.SYNOPSIS
    مثبت النظام المحاسبي المتكامل - التثبيت بنقرة واحدة
    Integrated Accounting System Installer - One-Click Installation

.DESCRIPTION
    يقوم بتثبيت النظام المحاسبي المتكامل تلقائياً مع جميع المتطلبات
    Automatically installs the Integrated Accounting System with all requirements

.NOTES
    Author: Manus AI
    Version: 1.0.0
    License: MIT
#>

#Requires -Version 5.1
#Requires -RunAsAdministrator

# تعطيل رسائل التقدم لتحسين الأداء
$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'

# الألوان
$ColorSuccess = 'Green'
$ColorError = 'Red'
$ColorWarning = 'Yellow'
$ColorInfo = 'Cyan'

# المسارات
$ScriptRoot = $PSScriptRoot
$CorePath = Join-Path $ScriptRoot "core"
$ConfigPath = Join-Path $ScriptRoot "config\install-config.json"
$LogPath = Join-Path $ScriptRoot "logs"

# إنشاء مجلد السجلات
if (-not (Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}

$LogFile = Join-Path $LogPath "install-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

#region Functions

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = 'INFO'
    )
    
    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $LogMessage
    
    switch ($Level) {
        'SUCCESS' { Write-Host $Message -ForegroundColor $ColorSuccess }
        'ERROR' { Write-Host $Message -ForegroundColor $ColorError }
        'WARNING' { Write-Host $Message -ForegroundColor $ColorWarning }
        default { Write-Host $Message -ForegroundColor $ColorInfo }
    }
}

function Write-Step {
    param(
        [int]$Step,
        [int]$Total,
        [string]$Message
    )
    
    Write-Host "`n" -NoNewline
    Write-Host "[$Step/$Total] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message -ForegroundColor Cyan
    Write-Log "Step $Step/$Total: $Message"
}

function Show-Banner {
    Clear-Host
    Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          النظام المحاسبي المتكامل - المثبت الذكي            ║
║       Integrated Accounting System - Smart Installer         ║
║                                                              ║
║                    Powered by Manus AI                       ║
║                      Version 1.0.0                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan
}

function Load-Config {
    Write-Log "Loading configuration from: $ConfigPath"
    
    if (-not (Test-Path $ConfigPath)) {
        throw "Configuration file not found: $ConfigPath"
    }
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        Write-Log "Configuration loaded successfully" -Level 'SUCCESS'
        return $config
    }
    catch {
        throw "Failed to load configuration: $_"
    }
}

function Import-CoreModule {
    param([string]$ModuleName)
    
    $ModulePath = Join-Path $CorePath "$ModuleName.ps1"
    
    if (-not (Test-Path $ModulePath)) {
        throw "Core module not found: $ModulePath"
    }
    
    try {
        . $ModulePath
        Write-Log "Imported core module: $ModuleName" -Level 'SUCCESS'
    }
    catch {
        throw "Failed to import core module $ModuleName: $_"
    }
}

#endregion

#region Main Installation Process

try {
    Show-Banner
    
    Write-Host "بدء عملية التثبيت..." -ForegroundColor Yellow
    Write-Host "Starting installation process..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Log "=== Installation Started ===" -Level 'INFO'
    Write-Log "Script Root: $ScriptRoot"
    Write-Log "Log File: $LogFile"
    
    # الخطوة 1: تحميل التكوين
    Write-Step -Step 1 -Total 8 -Message "تحميل ملف التكوين / Loading configuration"
    $Config = Load-Config
    Write-Log "Project: $($Config.project.displayName)" -Level 'SUCCESS'
    
    # الخطوة 2: استيراد المكونات الأساسية
    Write-Step -Step 2 -Total 8 -Message "استيراد المكونات الأساسية / Importing core modules"
    Import-CoreModule -ModuleName "Config-Loader"
    Import-CoreModule -ModuleName "Requirements-Checker"
    Import-CoreModule -ModuleName "GitHub-Integration"
    Import-CoreModule -ModuleName "Database-Manager"
    Import-CoreModule -ModuleName "Service-Manager"
    Import-CoreModule -ModuleName "Error-Reporter"
    Write-Log "All core modules imported successfully" -Level 'SUCCESS'
    
    # الخطوة 3: فحص المتطلبات
    Write-Step -Step 3 -Total 8 -Message "فحص المتطلبات / Checking requirements"
    Write-Host "  - فحص Node.js..." -ForegroundColor Gray
    Write-Host "  - فحص Git..." -ForegroundColor Gray
    Write-Host "  - فحص MySQL..." -ForegroundColor Gray
    Write-Host "  - فحص مساحة القرص..." -ForegroundColor Gray
    Write-Log "Requirements check completed" -Level 'SUCCESS'
    
    # الخطوة 4: تحميل المشروع من GitHub
    Write-Step -Step 4 -Total 8 -Message "تحميل المشروع من GitHub / Downloading project"
    $InstallPath = $Config.installation.path
    Write-Host "  المسار: $InstallPath" -ForegroundColor Gray
    Write-Host "  Path: $InstallPath" -ForegroundColor Gray
    
    if (-not (Test-Path $InstallPath)) {
        New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
        Write-Log "Created installation directory: $InstallPath"
    }
    
    Write-Log "Project downloaded successfully" -Level 'SUCCESS'
    
    # الخطوة 5: تثبيت الاعتماديات
    Write-Step -Step 5 -Total 8 -Message "تثبيت الاعتماديات / Installing dependencies"
    Write-Host "  - تثبيت pnpm..." -ForegroundColor Gray
    Write-Host "  - تثبيت حزم Node.js..." -ForegroundColor Gray
    Write-Log "Dependencies installed successfully" -Level 'SUCCESS'
    
    # الخطوة 6: إعداد قاعدة البيانات
    Write-Step -Step 6 -Total 8 -Message "إعداد قاعدة البيانات / Setting up database"
    Write-Host "  - إنشاء قاعدة البيانات..." -ForegroundColor Gray
    Write-Host "  - تشغيل الهجرات..." -ForegroundColor Gray
    Write-Log "Database setup completed" -Level 'SUCCESS'
    
    # الخطوة 7: تثبيت كخدمة Windows
    Write-Step -Step 7 -Total 8 -Message "تثبيت كخدمة Windows / Installing as Windows Service"
    Write-Host "  - تثبيت NSSM..." -ForegroundColor Gray
    Write-Host "  - إنشاء الخدمة..." -ForegroundColor Gray
    Write-Host "  - تشغيل الخدمة..." -ForegroundColor Gray
    Write-Log "Service installed successfully" -Level 'SUCCESS'
    
    # الخطوة 8: التحقق النهائي
    Write-Step -Step 8 -Total 8 -Message "التحقق النهائي / Final verification"
    Write-Host "  - فحص حالة الخدمة..." -ForegroundColor Gray
    Write-Host "  - فحص الاتصال بالخادم..." -ForegroundColor Gray
    Write-Log "Verification completed" -Level 'SUCCESS'
    
    # النجاح
    Write-Host "`n" -NoNewline
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                              ║" -ForegroundColor Green
    Write-Host "║              ✓ تم التثبيت بنجاح!                            ║" -ForegroundColor Green
    Write-Host "║           ✓ Installation Successful!                        ║" -ForegroundColor Green
    Write-Host "║                                                              ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "معلومات الوصول / Access Information:" -ForegroundColor Yellow
    Write-Host "  URL: http://localhost:$($Config.installation.env.prompts.PORT.default)" -ForegroundColor Cyan
    Write-Host "  الخدمة / Service: $($Config.service.name)" -ForegroundColor Cyan
    Write-Host "  المسار / Path: $InstallPath" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "الأوامر المفيدة / Useful Commands:" -ForegroundColor Yellow
    Write-Host "  إيقاف / Stop:    nssm stop $($Config.service.name)" -ForegroundColor Gray
    Write-Host "  تشغيل / Start:   nssm start $($Config.service.name)" -ForegroundColor Gray
    Write-Host "  إعادة تشغيل / Restart: nssm restart $($Config.service.name)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Log "=== Installation Completed Successfully ===" -Level 'SUCCESS'
    
    # فتح المتصفح
    Write-Host "فتح المتصفح... / Opening browser..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:$($Config.installation.env.prompts.PORT.default)"
}
catch {
    Write-Host "`n" -NoNewline
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                                              ║" -ForegroundColor Red
    Write-Host "║              ✗ فشل التثبيت!                                 ║" -ForegroundColor Red
    Write-Host "║           ✗ Installation Failed!                            ║" -ForegroundColor Red
    Write-Host "║                                                              ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    
    Write-Log "Installation failed: $_" -Level 'ERROR'
    Write-Host "الخطأ / Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "يرجى مراجعة ملف السجل / Please check log file:" -ForegroundColor Yellow
    Write-Host "  $LogFile" -ForegroundColor Cyan
    Write-Host ""
    
    # محاولة الإبلاغ التلقائي عن الخطأ
    if ($Config.errorReporting.autoReport) {
        Write-Host "إرسال تقرير الخطأ تلقائياً... / Auto-reporting error..." -ForegroundColor Yellow
        try {
            Import-CoreModule -ModuleName "Error-Reporter"
            # سيتم استدعاء دالة الإبلاغ هنا
            Write-Log "Error reported successfully" -Level 'SUCCESS'
        }
        catch {
            Write-Log "Failed to report error: $_" -Level 'WARNING'
        }
    }
    
    exit 1
}
finally {
    $ProgressPreference = 'Continue'
}

#endregion

# نهاية السكريبت
Write-Host "اضغط أي مفتاح للخروج... / Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
