@echo off
chcp 65001 >nul
title النظام المحاسبي المتكامل - التحديث / Accounting System - Update

:: التحقق من صلاحيات المسؤول
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                                                              ║
    echo ║          يرجى تشغيل البرنامج كمسؤول!                        ║
    echo ║       Please run as Administrator!                          ║
    echo ║                                                              ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)

:: تشغيل محدث PowerShell
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\Update-System.ps1"

pause
