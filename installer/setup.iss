; نظام العباسي الموحد - Inno Setup Script
; يقوم بإنشاء ملف تثبيت .exe لنظام Windows 10

#define MyAppName "نظام العباسي الموحد"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Alabasi Systems"
#define MyAppURL "https://github.com/alabasi2025/alabasi-unified-system"
#define MyAppExeName "alabasi-system.exe"

[Setup]
; معلومات التطبيق
AppId={{8F9A2B3C-4D5E-6F7A-8B9C-0D1E2F3A4B5C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\AlaabasiSystem
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=..\LICENSE
OutputDir=..\dist
OutputBaseFilename=alabasi-system-setup
SetupIconFile=..\assets\icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

; اللغة العربية
[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

[Files]
; ملفات النظام الأساسية
Source: "..\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "node_modules,dist,.git"
Source: "..\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\INSTALLATION_GUIDE.md"; DestDir: "{app}"; Flags: ignoreversion

; سكريبتات التثبيت
Source: "Install-AccountingSystem.ps1"; DestDir: "{app}\installer"; Flags: ignoreversion
Source: "Install.bat"; DestDir: "{app}\installer"; Flags: ignoreversion
Source: "Update.bat"; DestDir: "{app}\installer"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\installer\Install.bat"; WorkingDir: "{app}"
Name: "{group}\تحديث النظام"; Filename: "{app}\installer\Update.bat"; WorkingDir: "{app}"
Name: "{group}\دليل الاستخدام"; Filename: "{app}\INSTALLATION_GUIDE.md"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\installer\Install.bat"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
; تشغيل سكريبت التثبيت بعد الانتهاء
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\installer\Install-AccountingSystem.ps1"""; Description: "تثبيت وإعداد النظام"; Flags: postinstall shellexec runascurrentuser

[Code]
var
  NodeJSInstalled: Boolean;
  MySQLInstalled: Boolean;
  GitInstalled: Boolean;
  RequirementsPage: TOutputMsgMemoWizardPage;

// فحص تثبيت Node.js
function IsNodeJSInstalled: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

// فحص تثبيت MySQL
function IsMySQLInstalled: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('cmd.exe', '/c mysql --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

// فحص تثبيت Git
function IsGitInstalled: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('cmd.exe', '/c git --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

// إنشاء صفحة فحص المتطلبات
procedure InitializeWizard;
begin
  RequirementsPage := CreateOutputMsgMemoPage(wpWelcome,
    'فحص المتطلبات المسبقة', 
    'يتم الآن فحص المتطلبات المطلوبة لتشغيل النظام',
    'سيقوم البرنامج بفحص ما إذا كانت البرامج المطلوبة مثبتة على جهازك.');
end;

// فحص المتطلبات قبل التثبيت
function NextButtonClick(CurPageID: Integer): Boolean;
var
  MissingRequirements: String;
begin
  Result := True;
  
  if CurPageID = RequirementsPage.ID then
  begin
    // فحص Node.js
    NodeJSInstalled := IsNodeJSInstalled;
    if NodeJSInstalled then
      RequirementsPage.RichEditViewer.Lines.Add('✅ Node.js: مثبت')
    else
    begin
      RequirementsPage.RichEditViewer.Lines.Add('❌ Node.js: غير مثبت');
      MissingRequirements := MissingRequirements + '- Node.js' + #13#10;
    end;
    
    // فحص MySQL
    MySQLInstalled := IsMySQLInstalled;
    if MySQLInstalled then
      RequirementsPage.RichEditViewer.Lines.Add('✅ MySQL: مثبت')
    else
    begin
      RequirementsPage.RichEditViewer.Lines.Add('❌ MySQL: غير مثبت');
      MissingRequirements := MissingRequirements + '- MySQL' + #13#10;
    end;
    
    // فحص Git
    GitInstalled := IsGitInstalled;
    if GitInstalled then
      RequirementsPage.RichEditViewer.Lines.Add('✅ Git: مثبت')
    else
    begin
      RequirementsPage.RichEditViewer.Lines.Add('❌ Git: غير مثبت');
      MissingRequirements := MissingRequirements + '- Git' + #13#10;
    end;
    
    // عرض رسالة إذا كانت هناك متطلبات مفقودة
    if MissingRequirements <> '' then
    begin
      MsgBox('البرامج التالية غير مثبتة:' + #13#10 + #13#10 + MissingRequirements + #13#10 + 
             'سيقوم البرنامج بتثبيتها تلقائياً بعد اكتمال التثبيت.', 
             mbInformation, MB_OK);
    end;
  end;
end;

[UninstallDelete]
Type: filesandordirs; Name: "{app}\node_modules"
Type: filesandordirs; Name: "{app}\dist"
Type: filesandordirs; Name: "{app}\.git"
