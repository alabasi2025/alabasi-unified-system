# 🚀 مثبت النظام المحاسبي المتكامل
# Integrated Accounting System Installer

نظام تثبيت ذكي للنظام المحاسبي المتكامل مع تكامل GitHub والذكاء الاصطناعي.

Smart installation system for the Integrated Accounting System with GitHub integration and AI capabilities.

---

## ✨ الميزات / Features

### 🎯 **تثبيت بنقرة واحدة / One-Click Installation**
- تثبيت تلقائي كامل لجميع المتطلبات
- Full automatic installation of all requirements

### 🔄 **تحديثات تلقائية / Automatic Updates**
- فحص التحديثات من GitHub تلقائياً
- Automatic update checking from GitHub
- نسخ احتياطي قبل التحديث
- Backup before update
- تراجع تلقائي عند الفشل
- Automatic rollback on failure

### 🐛 **إبلاغ ذكي عن الأخطاء / Smart Error Reporting**
- إنشاء GitHub Issues تلقائياً
- Automatic GitHub Issues creation
- معلومات النظام الكاملة
- Complete system information
- سجلات مفصلة
- Detailed logs

### ⚙️ **خدمة Windows / Windows Service**
- تشغيل كخدمة Windows دائمة
- Run as persistent Windows service
- إعادة تشغيل تلقائية عند الفشل
- Automatic restart on failure
- إدارة سهلة
- Easy management

---

## 📋 المتطلبات / Requirements

### نظام التشغيل / Operating System
- Windows 10/11 (64-bit)
- صلاحيات المسؤول / Administrator privileges

### البرامج المطلوبة / Required Software
سيتم تثبيتها تلقائياً إذا لم تكن موجودة:
Will be installed automatically if not present:

- Node.js >= 18.0.0
- Git >= 2.0.0
- MySQL >= 8.0.0
- NSSM >= 2.24

### المتطلبات الأخرى / Other Requirements
- 2 GB RAM (4 GB موصى به / recommended)
- 1 GB مساحة قرص / disk space (5 GB موصى به / recommended)
- اتصال بالإنترنت / Internet connection

---

## 🚀 التثبيت / Installation

### الطريقة 1: التثبيت السريع / Quick Installation

1. **تحميل المشروع / Download Project**
   ```bash
   git clone https://github.com/alabasi2025/accounting-system.git
   cd accounting-system/installer
   ```

2. **تشغيل المثبت / Run Installer**
   - انقر بزر الماوس الأيمن على `Install.bat`
   - Right-click on `Install.bat`
   - اختر "Run as administrator"
   - Select "Run as administrator"

3. **انتظر حتى يكتمل التثبيت / Wait for completion**
   - سيتم فتح المتصفح تلقائياً
   - Browser will open automatically

### الطريقة 2: التثبيت اليدوي / Manual Installation

```powershell
# فتح PowerShell كمسؤول / Open PowerShell as Administrator
cd accounting-system/installer
.\Install-AccountingSystem.ps1
```

---

## 🔄 التحديث / Update

### تحديث بنقرة واحدة / One-Click Update

1. انقر بزر الماوس الأيمن على `Update.bat`
2. Right-click on `Update.bat`
3. اختر "Run as administrator"
4. Select "Run as administrator"

### تحديث يدوي / Manual Update

```powershell
cd accounting-system/installer
.\scripts\Update-System.ps1
```

---

## 🛠️ الإدارة / Management

### إدارة الخدمة / Service Management

```powershell
# إيقاف الخدمة / Stop Service
nssm stop AccountingSystem

# تشغيل الخدمة / Start Service
nssm start AccountingSystem

# إعادة تشغيل الخدمة / Restart Service
nssm restart AccountingSystem

# حالة الخدمة / Service Status
nssm status AccountingSystem

# حذف الخدمة / Remove Service
nssm remove AccountingSystem confirm
```

### الوصول إلى النظام / Access System

- **URL المحلي / Local URL:** http://localhost:3000
- **السجلات / Logs:** `C:\Projects\accounting-system\logs`
- **النسخ الاحتياطية / Backups:** `C:\Backups\accounting-system`

---

## 📁 البنية / Structure

```
installer/
├── core/                       # المكونات الأساسية / Core Modules
│   ├── Auto-Updater.ps1       # نظام التحديث التلقائي
│   ├── Config-Loader.ps1      # محمل التكوين
│   ├── Database-Manager.ps1   # مدير قاعدة البيانات
│   ├── Error-Reporter.ps1     # نظام الإبلاغ عن الأخطاء
│   ├── GitHub-Integration.ps1 # تكامل GitHub
│   ├── Requirements-Checker.ps1 # فاحص المتطلبات
│   └── Service-Manager.ps1    # مدير الخدمات
├── config/                    # ملفات التكوين / Configuration
│   └── install-config.json    # التكوين الرئيسي
├── scripts/                   # سكريبتات مساعدة / Helper Scripts
│   └── Update-System.ps1      # سكريبت التحديث
├── docs/                      # التوثيق / Documentation
├── logs/                      # السجلات / Logs
├── Install-AccountingSystem.ps1 # المثبت الرئيسي
├── Install.bat                # تثبيت سريع
├── Update.bat                 # تحديث سريع
└── README.md                  # هذا الملف
```

---

## ⚙️ التكوين / Configuration

### ملف التكوين / Configuration File

`config/install-config.json` - يحتوي على جميع إعدادات التثبيت:

- **معلومات المشروع / Project Info**
- **إعدادات GitHub / GitHub Settings**
- **المتطلبات / Requirements**
- **إعدادات الخدمة / Service Settings**
- **المراقبة / Monitoring**
- **النسخ الاحتياطي / Backup**
- **الإبلاغ عن الأخطاء / Error Reporting**

### تخصيص التكوين / Customize Configuration

```json
{
  "project": {
    "name": "accounting-system",
    "displayName": "النظام المحاسبي المتكامل"
  },
  "installation": {
    "path": "C:\\Projects\\accounting-system"
  }
}
```

---

## 🐛 استكشاف الأخطاء / Troubleshooting

### المشكلة: فشل التثبيت / Installation Failed

**الحل / Solution:**
1. تأكد من تشغيل المثبت كمسؤول
2. Ensure running as Administrator
3. تحقق من اتصال الإنترنت
4. Check internet connection
5. راجع ملف السجل في `logs/`
6. Check log file in `logs/`

### المشكلة: الخدمة لا تعمل / Service Not Running

**الحل / Solution:**
```powershell
# فحص حالة الخدمة
nssm status AccountingSystem

# إعادة تشغيل الخدمة
nssm restart AccountingSystem

# فحص السجلات
Get-Content C:\Projects\accounting-system\logs\latest.log -Tail 50
```

### المشكلة: خطأ في قاعدة البيانات / Database Error

**الحل / Solution:**
1. تأكد من تشغيل MySQL
2. Ensure MySQL is running
3. تحقق من بيانات الاتصال في `.env`
4. Check connection details in `.env`

---

## 📞 الدعم / Support

### الموارد / Resources
- 📚 **التوثيق / Documentation:** [GitHub Wiki](https://github.com/alabasi2025/accounting-system/wiki)
- 🐛 **الإبلاغ عن مشاكل / Report Issues:** [GitHub Issues](https://github.com/alabasi2025/accounting-system/issues)
- 💬 **المناقشات / Discussions:** [GitHub Discussions](https://github.com/alabasi2025/accounting-system/discussions)

### الاتصال / Contact
- 🌐 **الموقع / Website:** https://manus.im
- 📧 **البريد الإلكتروني / Email:** support@manus.im

---

## 📄 الترخيص / License

MIT License - يمكن استخدامه بحرية في المشاريع التجارية والشخصية.

MIT License - Free to use in commercial and personal projects.

---

## 🎉 شكر خاص / Special Thanks

- **Manus AI** - للذكاء الاصطناعي المتقدم
- **Universal Installer System** - للبنية الأساسية
- **المجتمع / Community** - للدعم والمساهمات

---

**صُنع بـ ❤️ بواسطة Manus AI**

**Made with ❤️ by Manus AI**

**الإصدار / Version:** 1.0.0  
**التاريخ / Date:** نوفمبر 2025 / November 2025
