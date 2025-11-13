@echo off
chcp 65001 >nul
title نظام العباسي الموحد - التثبيت

echo.
echo ═══════════════════════════════════════════════════════
echo        نظام العباسي الموحد - برنامج التثبيت
echo ═══════════════════════════════════════════════════════
echo.
echo جاري بدء التثبيت...
echo.

REM التحقق من صلاحيات المسؤول
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ يجب تشغيل البرنامج كمسؤول!
    echo.
    echo انقر بزر الماوس الأيمن على الملف واختر "تشغيل كمسؤول"
    echo.
    pause
    exit /b 1
)

REM تشغيل سكريبت PowerShell
powershell.exe -ExecutionPolicy Bypass -File "%~dp0Windows10-Installer.ps1"

if %errorLevel% equ 0 (
    echo.
    echo ✅ تم التثبيت بنجاح!
) else (
    echo.
    echo ❌ حدث خطأ أثناء التثبيت!
    echo يرجى مراجعة ملف السجل: %TEMP%\AlaabasiInstaller\install.log
)

echo.
pause
