# نظام العباسي الموحد - برنامج التثبيت لـ Windows 10
# يقوم بتثبيت جميع المتطلبات والنظام بشكل تلقائي

#Requires -RunAsAdministrator

# الألوان والتنسيق
$Host.UI.RawUI.WindowTitle = "نظام العباسي الموحد - التثبيت"
$ProgressPreference = 'SilentlyContinue'

# المتغيرات الأساسية
$InstallPath = "C:\AlaabasiSystem"
$TempPath = "$env:TEMP\AlaabasiInstaller"
$LogFile = "$TempPath\install.log"

# إنشاء مجلد مؤقت
New-Item -ItemType Directory -Force -Path $TempPath | Out-Null

# دالة لكتابة السجلات
function Write-Log {
    param($Message, $Type = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Type] $Message"
    Add-Content -Path $LogFile -Value $LogMessage
    
    switch ($Type) {
        "SUCCESS" { Write-Host "✅ $Message" -ForegroundColor Green }
        "ERROR"   { Write-Host "❌ $Message" -ForegroundColor Red }
        "WARNING" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        default   { Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
    }
}

# دالة لعرض شريط التقدم
function Show-Progress {
    param($Activity, $Status, $PercentComplete)
    Write-Progress -Activity $Activity -Status $Status -PercentComplete $PercentComplete
}

# دالة لفحص تثبيت البرامج
function Test-ProgramInstalled {
    param($ProgramName, $Command)
    try {
        $null = & $Command --version 2>&1
        return $true
    } catch {
        return $false
    }
}

# دالة لتحميل وتثبيت Node.js
function Install-NodeJS {
    Write-Log "تحميل وتثبيت Node.js..."
    Show-Progress -Activity "تثبيت Node.js" -Status "جاري التحميل..." -PercentComplete 10
    
    $NodeURL = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    $NodeInstaller = "$TempPath\nodejs.msi"
    
    try {
        Invoke-WebRequest -Uri $NodeURL -OutFile $NodeInstaller -UseBasicParsing
        Write-Log "تم تحميل Node.js بنجاح" "SUCCESS"
        
        Show-Progress -Activity "تثبيت Node.js" -Status "جاري التثبيت..." -PercentComplete 50
        Start-Process msiexec.exe -ArgumentList "/i `"$NodeInstaller`" /quiet /norestart" -Wait
        
        # تحديث PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        Write-Log "تم تثبيت Node.js بنجاح" "SUCCESS"
        return $true
    } catch {
        Write-Log "فشل تثبيت Node.js: $_" "ERROR"
        return $false
    }
}

# دالة لتحميل وتثبيت MySQL
function Install-MySQL {
    Write-Log "تحميل وتثبيت MySQL..."
    Show-Progress -Activity "تثبيت MySQL" -Status "جاري التحميل..." -PercentComplete 10
    
    $MySQLURL = "https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-8.0.35.0.msi"
    $MySQLInstaller = "$TempPath\mysql.msi"
    
    try {
        Invoke-WebRequest -Uri $MySQLURL -OutFile $MySQLInstaller -UseBasicParsing
        Write-Log "تم تحميل MySQL بنجاح" "SUCCESS"
        
        Show-Progress -Activity "تثبيت MySQL" -Status "جاري التثبيت..." -PercentComplete 50
        Start-Process msiexec.exe -ArgumentList "/i `"$MySQLInstaller`" /quiet /norestart" -Wait
        
        Write-Log "تم تثبيت MySQL بنجاح" "SUCCESS"
        return $true
    } catch {
        Write-Log "فشل تثبيت MySQL: $_" "ERROR"
        return $false
    }
}

# دالة لتحميل وتثبيت Git
function Install-Git {
    Write-Log "تحميل وتثبيت Git..."
    Show-Progress -Activity "تثبيت Git" -Status "جاري التحميل..." -PercentComplete 10
    
    $GitURL = "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe"
    $GitInstaller = "$TempPath\git.exe"
    
    try {
        Invoke-WebRequest -Uri $GitURL -OutFile $GitInstaller -UseBasicParsing
        Write-Log "تم تحميل Git بنجاح" "SUCCESS"
        
        Show-Progress -Activity "تثبيت Git" -Status "جاري التثبيت..." -PercentComplete 50
        Start-Process -FilePath $GitInstaller -ArgumentList "/VERYSILENT /NORESTART" -Wait
        
        Write-Log "تم تثبيت Git بنجاح" "SUCCESS"
        return $true
    } catch {
        Write-Log "فشل تثبيت Git: $_" "ERROR"
        return $false
    }
}

# دالة لإعداد قاعدة البيانات
function Setup-Database {
    Write-Log "إعداد قاعدة البيانات..."
    Show-Progress -Activity "إعداد قاعدة البيانات" -Status "جاري الإنشاء..." -PercentComplete 70
    
    try {
        # إنشاء قاعدة البيانات
        $MySQLCommands = @"
CREATE DATABASE IF NOT EXISTS alabasi_unified CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'alabasi'@'localhost' IDENTIFIED BY 'alabasi123';
GRANT ALL PRIVILEGES ON alabasi_unified.* TO 'alabasi'@'localhost';
FLUSH PRIVILEGES;
"@
        
        $MySQLCommands | mysql -u root
        
        # تطبيق الجداول
        if (Test-Path "$InstallPath\create_tables.sql") {
            mysql -u alabasi -palabasi123 alabasi_unified < "$InstallPath\create_tables.sql"
            Write-Log "تم إنشاء الجداول بنجاح" "SUCCESS"
        }
        
        # تحميل البيانات التجريبية
        if (Test-Path "$InstallPath\comprehensive_test_data.sql") {
            mysql -u alabasi -palabasi123 alabasi_unified < "$InstallPath\comprehensive_test_data.sql"
            Write-Log "تم تحميل البيانات التجريبية بنجاح" "SUCCESS"
        }
        
        return $true
    } catch {
        Write-Log "فشل إعداد قاعدة البيانات: $_" "ERROR"
        return $false
    }
}

# دالة لتثبيت مكتبات Node.js
function Install-Dependencies {
    Write-Log "تثبيت مكتبات Node.js..."
    Show-Progress -Activity "تثبيت المكتبات" -Status "جاري التثبيت..." -PercentComplete 80
    
    try {
        Set-Location $InstallPath
        
        # تثبيت pnpm
        npm install -g pnpm 2>&1 | Out-Null
        
        # تثبيت المكتبات
        pnpm install 2>&1 | Out-Null
        
        Write-Log "تم تثبيت المكتبات بنجاح" "SUCCESS"
        return $true
    } catch {
        Write-Log "فشل تثبيت المكتبات: $_" "ERROR"
        return $false
    }
}

# دالة لإنشاء ملف .env
function Create-EnvFile {
    Write-Log "إنشاء ملف التكوين..."
    
    $EnvContent = @"
# Database
DATABASE_URL=mysql://alabasi:alabasi123@localhost:3306/alabasi_unified

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=$(New-Guid)

# GitHub
GITHUB_REPO=alabasi2025/alabasi-unified-system
GITHUB_BRANCH=main
"@
    
    Set-Content -Path "$InstallPath\.env" -Value $EnvContent
    Write-Log "تم إنشاء ملف التكوين بنجاح" "SUCCESS"
}

# دالة لإنشاء اختصارات سطح المكتب
function Create-Shortcuts {
    Write-Log "إنشاء الاختصارات..."
    
    $WshShell = New-Object -ComObject WScript.Shell
    
    # اختصار تشغيل النظام
    $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\نظام العباسي الموحد.lnk")
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$InstallPath\start.ps1`""
    $Shortcut.WorkingDirectory = $InstallPath
    $Shortcut.IconLocation = "$InstallPath\assets\icon.ico"
    $Shortcut.Save()
    
    Write-Log "تم إنشاء الاختصارات بنجاح" "SUCCESS"
}

# دالة لإنشاء سكريبت التشغيل
function Create-StartScript {
    $StartScript = @"
# تشغيل نظام العباسي الموحد
Set-Location "$InstallPath"
Start-Process "http://localhost:3000"
pnpm dev
"@
    
    Set-Content -Path "$InstallPath\start.ps1" -Value $StartScript
    Write-Log "تم إنشاء سكريبت التشغيل بنجاح" "SUCCESS"
}

# البرنامج الرئيسي
function Main {
    Clear-Host
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "       نظام العباسي الموحد - برنامج التثبيت" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Log "بدء عملية التثبيت..."
    
    # الخطوة 1: فحص المتطلبات
    Write-Host "🔍 الخطوة 1: فحص المتطلبات المسبقة..." -ForegroundColor Cyan
    Show-Progress -Activity "فحص المتطلبات" -Status "جاري الفحص..." -PercentComplete 5
    
    $NodeInstalled = Test-ProgramInstalled -ProgramName "Node.js" -Command "node"
    $MySQLInstalled = Test-ProgramInstalled -ProgramName "MySQL" -Command "mysql"
    $GitInstalled = Test-ProgramInstalled -ProgramName "Git" -Command "git"
    
    if (-not $NodeInstalled) {
        Write-Log "Node.js غير مثبت" "WARNING"
        if (-not (Install-NodeJS)) {
            Write-Log "فشل تثبيت Node.js" "ERROR"
            return
        }
    } else {
        Write-Log "Node.js مثبت مسبقاً" "SUCCESS"
    }
    
    if (-not $MySQLInstalled) {
        Write-Log "MySQL غير مثبت" "WARNING"
        if (-not (Install-MySQL)) {
            Write-Log "فشل تثبيت MySQL" "ERROR"
            return
        }
    } else {
        Write-Log "MySQL مثبت مسبقاً" "SUCCESS"
    }
    
    if (-not $GitInstalled) {
        Write-Log "Git غير مثبت" "WARNING"
        if (-not (Install-Git)) {
            Write-Log "فشل تثبيت Git" "ERROR"
            return
        }
    } else {
        Write-Log "Git مثبت مسبقاً" "SUCCESS"
    }
    
    # الخطوة 2: تحميل النظام من GitHub
    Write-Host ""
    Write-Host "📥 الخطوة 2: تحميل النظام من GitHub..." -ForegroundColor Cyan
    Show-Progress -Activity "تحميل النظام" -Status "جاري التحميل..." -PercentComplete 30
    
    if (Test-Path $InstallPath) {
        Write-Log "المجلد موجود مسبقاً، سيتم التحديث..." "WARNING"
        Set-Location $InstallPath
        git pull origin main 2>&1 | Out-Null
    } else {
        git clone https://github.com/alabasi2025/alabasi-unified-system.git $InstallPath 2>&1 | Out-Null
    }
    Write-Log "تم تحميل النظام بنجاح" "SUCCESS"
    
    # الخطوة 3: إعداد قاعدة البيانات
    Write-Host ""
    Write-Host "🗄️  الخطوة 3: إعداد قاعدة البيانات..." -ForegroundColor Cyan
    if (-not (Setup-Database)) {
        Write-Log "فشل إعداد قاعدة البيانات" "ERROR"
        return
    }
    
    # الخطوة 4: تثبيت المكتبات
    Write-Host ""
    Write-Host "📦 الخطوة 4: تثبيت المكتبات..." -ForegroundColor Cyan
    if (-not (Install-Dependencies)) {
        Write-Log "فشل تثبيت المكتبات" "ERROR"
        return
    }
    
    # الخطوة 5: إنشاء ملفات التكوين
    Write-Host ""
    Write-Host "⚙️  الخطوة 5: إنشاء ملفات التكوين..." -ForegroundColor Cyan
    Show-Progress -Activity "إنشاء التكوين" -Status "جاري الإنشاء..." -PercentComplete 90
    Create-EnvFile
    Create-StartScript
    Create-Shortcuts
    
    # الانتهاء
    Show-Progress -Activity "التثبيت" -Status "اكتمل!" -PercentComplete 100
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "       ✅ تم التثبيت بنجاح!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Log "اكتمل التثبيت بنجاح!" "SUCCESS"
    Write-Host "📁 مسار التثبيت: $InstallPath" -ForegroundColor Cyan
    Write-Host "🌐 رابط النظام: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📧 البريد الإلكتروني: admin@alabasi.com" -ForegroundColor Cyan
    Write-Host "🔑 كلمة المرور: admin123" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "لتشغيل النظام، انقر نقرًا مزدوجًا على الاختصار الموجود على سطح المكتب." -ForegroundColor Yellow
    Write-Host ""
    
    # فتح المتصفح
    $Response = Read-Host "هل تريد تشغيل النظام الآن؟ (Y/N)"
    if ($Response -eq "Y" -or $Response -eq "y") {
        Set-Location $InstallPath
        Start-Process "http://localhost:3000"
        pnpm dev
    }
}

# تشغيل البرنامج الرئيسي
Main
