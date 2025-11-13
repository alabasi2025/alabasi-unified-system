# 🏗️ المعمارية الذكية - نظام العباسي الموحد

## 🎯 الرؤية

بناء نظام موحد ذكي ومتين يعتمد على **معمارية الوحدات المستقلة (Modular Microservices)** مع **Multi-Tenancy** على مستوى الوحدات المحاسبية، مما يضمن المرونة والقابلية للتوسع وسهولة الصيانة.

---

## 📐 المبادئ الأساسية

### 1. **Separation of Concerns**
كل وحدة مسؤولة عن مجال عمل محدد ولا تتداخل مع الوحدات الأخرى.

### 2. **Single Source of Truth**
النواة الأساسية (Core) هي المصدر الوحيد للحقيقة للبيانات المشتركة.

### 3. **Loose Coupling**
الوحدات مستقلة ومرتبطة بشكل فضفاض عبر **Event Bus**.

### 4. **High Cohesion**
كل وحدة تحتوي على كل ما تحتاجه للعمل بشكل مستقل.

### 5. **Fail-Safe**
فشل وحدة واحدة لا يؤثر على باقي النظام.

---

## 🏛️ المعمارية الشاملة

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Port 3000)                  │
│              Routing, Authentication, Rate Limiting          │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │   Event Bus     │ (Redis/RabbitMQ)
    │  (Pub/Sub)      │
    └────────┬────────┘
             │
    ┌────────┴─────────────────────────────────────────────┐
    │                                                       │
┌───▼────┐  ┌──────────┐  ┌───────┐  ┌─────────┐  ┌─────┐
│  Core  │  │Accounting│  │ Power │  │ Billing │  │ ... │
│ Module │  │  Module  │  │Module │  │ Module  │  │     │
└───┬────┘  └────┬─────┘  └───┬───┘  └────┬────┘  └──┬──┘
    │            │            │           │          │
┌───▼────┐  ┌───▼─────┐  ┌───▼───┐  ┌───▼────┐  ┌─▼───┐
│Core DB │  │Acct DB  │  │Power  │  │Billing │  │ ... │
│(Shared)│  │(Module) │  │  DB   │  │   DB   │  │     │
└────────┘  └─────────┘  └───────┘  └────────┘  └─────┘
```

---

## 🗄️ استراتيجية قاعدة البيانات

### **Database per Module + Shared Core**

#### **Core Database (مشتركة)**
- `users`
- `units` (الوحدات المحاسبية)
- `organizations` (المؤسسات)
- `branches` (الفروع)
- `currencies`
- `module_registry` (سجل الوحدات المثبتة)
- `inter_module_transactions` (المعاملات بين الوحدات)

#### **Module-Specific Databases**
كل وحدة لها قاعدة بيانات خاصة:
- `alabasi_accounting`
- `alabasi_power`
- `alabasi_billing`
- ...

**الفوائد:**
- عزل البيانات بين الوحدات
- سهولة النسخ الاحتياطي لوحدة محددة
- إمكانية توزيع قواعد البيانات على خوادم مختلفة
- أمان أعلى

---

## 🔌 نظام الوحدات (Plugin System)

### **Module Structure**

```typescript
interface Module {
  id: string;                    // "accounting"
  name: string;                  // "Accounting Module"
  version: string;               // "1.0.0"
  required: boolean;             // true/false
  dependencies: string[];        // ["core"]
  
  // Database
  database: {
    name: string;                // "alabasi_accounting"
    tables: string[];            // ["chartOfAccounts", ...]
    migrations: Migration[];
  };
  
  // API
  routes: Route[];               // ["/api/accounting/..."]
  middlewares: Middleware[];
  
  // Events
  subscribes: string[];          // ["user.created", ...]
  publishes: string[];           // ["invoice.created", ...]
  
  // UI
  components: Component[];
  pages: Page[];
  menu: MenuItem[];
  
  // Lifecycle
  onInstall: () => Promise<void>;
  onUninstall: () => Promise<void>;
  onEnable: () => Promise<void>;
  onDisable: () => Promise<void>;
}
```

### **Module Registry**

```sql
CREATE TABLE module_registry (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module_id VARCHAR(50) UNIQUE NOT NULL,
  version VARCHAR(20) NOT NULL,
  is_installed BOOLEAN DEFAULT FALSE,
  is_enabled BOOLEAN DEFAULT FALSE,
  installed_at DATETIME,
  config JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Event-Driven Architecture

### **Event Bus**

استخدام **Redis Pub/Sub** أو **RabbitMQ** للتواصل بين الوحدات.

**مثال:**

```typescript
// في وحدة Core
eventBus.publish('user.created', {
  userId: 123,
  username: 'ahmad',
  unitId: 1
});

// في وحدة Accounting
eventBus.subscribe('user.created', async (event) => {
  // إنشاء حساب محاسبي للمستخدم الجديد
  await createAccountForUser(event.userId);
});
```

**الفوائد:**
- فصل كامل بين الوحدات
- سهولة إضافة وحدات جديدة
- إمكانية معالجة الأحداث بشكل غير متزامن

---

## 🌐 API Gateway

### **المسؤوليات:**
1. **Routing**: توجيه الطلبات إلى الوحدة المناسبة
2. **Authentication**: التحقق من الهوية
3. **Authorization**: التحقق من الصلاحيات
4. **Rate Limiting**: الحد من معدل الطلبات
5. **Logging**: تسجيل جميع الطلبات
6. **Error Handling**: معالجة الأخطاء بشكل موحد

**مثال:**

```typescript
// /api/accounting/* → Accounting Module
// /api/power/* → Power Module
// /api/billing/* → Billing Module
```

---

## 🏢 Multi-Tenancy (الوحدات المحاسبية)

### **الهيكلية الهرمية:**

```
Unit (الوحدة المحاسبية)
  └── Organization (المؤسسة)
        └── Branch (الفرع)
```

### **Data Isolation:**

كل **Unit** لها بيانات منفصلة تمامًا:

```sql
SELECT * FROM chartOfAccounts 
WHERE unit_id = 1 AND organization_id = 5;
```

### **Inter-Unit Transactions:**

المعاملات بين الوحدات تتم عبر **حسابات وسيطة**:

```sql
CREATE TABLE inter_unit_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  from_unit_id INT NOT NULL,
  to_unit_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  intermediary_account_id INT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 الأمان (Security)

### **1. Authentication**
- JWT Tokens
- Refresh Tokens
- Session Management

### **2. Authorization**
- Role-Based Access Control (RBAC)
- Permission-Based Access Control (PBAC)
- Row-Level Security (RLS)

### **3. Data Encryption**
- Encryption at Rest (قاعدة البيانات)
- Encryption in Transit (HTTPS/TLS)
- Sensitive Data Masking

### **4. Audit Trail**
تسجيل جميع العمليات:

```sql
CREATE TABLE audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  module_id VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 نظام التثبيت الذكي

### **المراحل:**

1. **Pre-Installation Check**
   - فحص المتطلبات (Node.js, MySQL, Git)
   - فحص المنافذ المتاحة
   - فحص الصلاحيات

2. **Core Installation**
   - تثبيت النواة الأساسية (Core)
   - إنشاء قاعدة البيانات الأساسية
   - إعداد API Gateway

3. **Module Selection**
   - عرض قائمة الوحدات المتاحة
   - السماح باختيار الوحدات المطلوبة
   - التحقق من التبعيات

4. **Module Installation**
   - تثبيت كل وحدة بشكل منفصل
   - إنشاء قاعدة بيانات الوحدة
   - تسجيل الوحدة في `module_registry`

5. **Post-Installation**
   - اختبار الاتصال
   - إنشاء مستخدم admin
   - فتح المتصفح

### **التحديث التلقائي:**

```powershell
# فحص التحديثات من GitHub
$latestVersion = Invoke-RestMethod -Uri "https://api.github.com/repos/alabasi2025/alabasi-unified-system/releases/latest"

if ($latestVersion.tag_name -gt $currentVersion) {
  # نسخ احتياطي
  Backup-System
  
  # تحديث
  Update-System -Version $latestVersion.tag_name
  
  # اختبار
  Test-System
  
  # إشعار المستخدم
  Show-Notification "تم التحديث إلى الإصدار $($latestVersion.tag_name)"
}
```

---

## 📊 المراقبة والصحة (Monitoring & Health)

### **Health Check Endpoints:**

```
GET /health
GET /health/core
GET /health/accounting
GET /health/database
```

### **Metrics:**

- عدد الطلبات (Requests/sec)
- زمن الاستجابة (Response Time)
- معدل الأخطاء (Error Rate)
- استخدام الذاكرة (Memory Usage)
- استخدام المعالج (CPU Usage)

---

## 🎨 الواجهة الأمامية (Frontend)

### **Micro Frontends:**

كل وحدة لها واجهة مستقلة:

```
client/
├── core/           # الواجهة الأساسية
├── accounting/     # واجهة المحاسبة
├── power/          # واجهة الطاقة
└── ...
```

### **Dynamic Module Loading:**

```typescript
// تحميل وحدة ديناميكياً
const AccountingModule = await import('./modules/accounting');
registerModule(AccountingModule);
```

---

## ✅ الخلاصة

هذه المعمارية تضمن:

- ✅ **المرونة**: إضافة/إزالة وحدات بسهولة
- ✅ **القابلية للتوسع**: كل وحدة يمكن توسيعها بشكل مستقل
- ✅ **الصيانة**: سهولة صيانة كل وحدة على حدة
- ✅ **الأمان**: عزل كامل بين الوحدات
- ✅ **الأداء**: إمكانية توزيع الوحدات على خوادم مختلفة
- ✅ **التجربة**: تجربة مستخدم سلسة وموحدة

---

**المرحلة التالية:** بناء النواة الأساسية (Core) وتطبيق هذه المعمارية.
