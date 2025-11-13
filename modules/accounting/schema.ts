import { mysqlTable, varchar, int, datetime, tinyint, text, decimal, json, unique, index } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ====================================
// Accounting Module Schema
// وحدة المحاسبة
// ====================================

// ============ دليل الحسابات (Chart of Accounts) ============

// أنواع الحسابات الرئيسية
export const accountTypes = mysqlTable("account_types", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull().unique(), // "assets", "liabilities", "equity", "revenue", "expenses"
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  normalBalance: varchar("normal_balance", { length: 10 }).notNull(), // "debit" or "credit"
  displayOrder: int("display_order").default(0),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// دليل الحسابات
export const chartOfAccounts = mysqlTable("chart_of_accounts", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  // الهيكلية الهرمية
  parentId: int("parent_id"), // null = حساب رئيسي
  level: int("level").default(1), // مستوى الحساب في الشجرة
  path: varchar("path", { length: 500 }), // "1/5/12" للبحث السريع
  
  // نوع الحساب
  accountTypeId: int("account_type_id"), // يُملأ فقط للحسابات الفرعية
  
  // نوع الحساب التحليلي (فقط للحسابات الفرعية)
  analyticalType: varchar("analytical_type", { length: 50 }), // "fund", "bank", "cashier", "wallet", "customer", "supplier", "warehouse", null
  
  // العملات المفضلة (فقط للحسابات الفرعية)
  preferredCurrencies: json("preferred_currencies"), // [1, 2, 3] - IDs من جدول currencies
  
  // الربط بالهيكلية
  unitId: int("unit_id").notNull(),
  organizationId: int("organization_id").notNull(), // دليل الحسابات مربوط بالمؤسسة
  
  // خصائص إضافية
  isParent: tinyint("is_parent").default(0), // 1 = حساب رئيسي، 0 = حساب فرعي
  hasAnalytical: tinyint("has_analytical").default(0), // هل له حسابات تحليلية؟
  isActive: tinyint("is_active").default(1),
  notes: text("notes"),
  
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueCodePerOrg: unique().on(table.code, table.organizationId),
  unitIdx: index("unit_idx").on(table.unitId),
  orgIdx: index("org_idx").on(table.organizationId),
  parentIdx: index("parent_idx").on(table.parentId),
}));

// ============ الحسابات التحليلية (Analytical Accounts) ============

// الصناديق (القالب العام)
export const funds = mysqlTable("funds", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  
  // الربط بدليل الحسابات
  chartAccountId: int("chart_account_id").notNull(),
  
  // العملات المسموحة (مستمدة من دليل الحسابات)
  allowedCurrencies: json("allowed_currencies"), // [1, 2] - يمكن اختيار الكل أو البعض
  
  // الربط بالهيكلية
  unitId: int("unit_id").notNull(),
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id"), // optional
  
  // خصائص إضافية
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: tinyint("is_active").default(1),
  notes: text("notes"),
  
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueCodePerOrg: unique().on(table.code, table.organizationId),
  chartAccountIdx: index("chart_account_idx").on(table.chartAccountId),
}));

// البنوك (نفس هيكلية الصناديق)
export const banks = mysqlTable("banks", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  chartAccountId: int("chart_account_id").notNull(),
  allowedCurrencies: json("allowed_currencies"),
  unitId: int("unit_id").notNull(),
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id"),
  
  // خصائص إضافية للبنوك
  accountNumber: varchar("account_number", { length: 100 }),
  iban: varchar("iban", { length: 100 }),
  swiftCode: varchar("swift_code", { length: 50 }),
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  
  isActive: tinyint("is_active").default(1),
  notes: text("notes"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueCodePerOrg: unique().on(table.code, table.organizationId),
  chartAccountIdx: index("chart_account_idx").on(table.chartAccountId),
}));

// الصرافين (نفس هيكلية الصناديق)
export const cashiers = mysqlTable("cashiers", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  chartAccountId: int("chart_account_id").notNull(),
  allowedCurrencies: json("allowed_currencies"),
  unitId: int("unit_id").notNull(),
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id"),
  
  // ربط بالموظف
  employeeId: int("employee_id"),
  
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: tinyint("is_active").default(1),
  notes: text("notes"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueCodePerOrg: unique().on(table.code, table.organizationId),
  chartAccountIdx: index("chart_account_idx").on(table.chartAccountId),
}));

// العملاء
export const customers = mysqlTable("customers", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  chartAccountId: int("chart_account_id").notNull(),
  allowedCurrencies: json("allowed_currencies"),
  unitId: int("unit_id").notNull(),
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id"),
  
  // معلومات إضافية
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  taxNumber: varchar("tax_number", { length: 100 }),
  
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: tinyint("is_active").default(1),
  notes: text("notes"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueCodePerOrg: unique().on(table.code, table.organizationId),
  chartAccountIdx: index("chart_account_idx").on(table.chartAccountId),
}));

// الموردين
export const suppliers = mysqlTable("suppliers", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  chartAccountId: int("chart_account_id").notNull(),
  allowedCurrencies: json("allowed_currencies"),
  unitId: int("unit_id").notNull(),
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id"),
  
  // معلومات إضافية
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  taxNumber: varchar("tax_number", { length: 100 }),
  
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: tinyint("is_active").default(1),
  notes: text("notes"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueCodePerOrg: unique().on(table.code, table.organizationId),
  chartAccountIdx: index("chart_account_idx").on(table.chartAccountId),
}));

// ============ القيود اليومية (Journal Entries) ============

// رأس القيد
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").primaryKey().autoincrement(),
  entryNumber: varchar("entry_number", { length: 50 }).notNull(),
  entryDate: datetime("entry_date").notNull(),
  entryType: varchar("entry_type", { length: 50 }).default("manual"), // "manual", "auto", "opening", "closing"
  
  // الربط بالهيكلية
  unitId: int("unit_id").notNull(),
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id"),
  
  // المبالغ
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).notNull(),
  
  // الحالة
  status: varchar("status", { length: 20 }).default("draft"), // "draft", "posted", "cancelled"
  postedAt: datetime("posted_at"),
  postedBy: int("posted_by"),
  
  description: text("description"),
  reference: varchar("reference", { length: 255 }), // مرجع خارجي (فاتورة، سند، إلخ)
  
  createdBy: int("created_by").notNull(),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueNumberPerOrg: unique().on(table.entryNumber, table.organizationId),
  unitIdx: index("unit_idx").on(table.unitId),
  orgIdx: index("org_idx").on(table.organizationId),
  dateIdx: index("date_idx").on(table.entryDate),
  statusIdx: index("status_idx").on(table.status),
}));

// تفاصيل القيد
export const journalEntryLines = mysqlTable("journal_entry_lines", {
  id: int("id").primaryKey().autoincrement(),
  journalEntryId: int("journal_entry_id").notNull(),
  lineNumber: int("line_number").notNull(),
  
  // الحساب
  chartAccountId: int("chart_account_id").notNull(),
  analyticalAccountType: varchar("analytical_account_type", { length: 50 }), // "fund", "bank", "cashier", "customer", "supplier"
  analyticalAccountId: int("analytical_account_id"), // ID من الجدول المناسب
  
  // المبالغ
  debit: decimal("debit", { precision: 15, scale: 2 }).default("0.00"),
  credit: decimal("credit", { precision: 15, scale: 2 }).default("0.00"),
  currencyId: int("currency_id").notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1.0000"),
  
  description: text("description"),
  
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  journalEntryIdx: index("journal_entry_idx").on(table.journalEntryId),
  chartAccountIdx: index("chart_account_idx").on(table.chartAccountId),
}));

// ============ سندات القبض والصرف (Vouchers) ============

// سندات القبض
export const receiptVouchers = mysqlTable("receipt_vouchers", {
  id: int("id").primaryKey().autoincrement(),
  voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
  voucherDate: datetime("voucher_date").notNull(),
  
  // الربط بالهيكلية
  unitId: int("unit_id").notNull(),
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id"),
  
  // من/إلى
  fromAccountType: varchar("from_account_type", { length: 50 }).notNull(), // "customer", "fund", "bank"
  fromAccountId: int("from_account_id").notNull(),
  toAccountType: varchar("to_account_type", { length: 50 }).notNull(), // "fund", "bank", "cashier"
  toAccountId: int("to_account_id").notNull(),
  
  // المبلغ
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currencyId: int("currency_id").notNull(),
  
  // الربط بالقيد
  journalEntryId: int("journal_entry_id"),
  
  description: text("description"),
  status: varchar("status", { length: 20 }).default("draft"),
  
  createdBy: int("created_by").notNull(),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueNumberPerOrg: unique().on(table.voucherNumber, table.organizationId),
  unitIdx: index("unit_idx").on(table.unitId),
  orgIdx: index("org_idx").on(table.organizationId),
  dateIdx: index("date_idx").on(table.voucherDate),
}));

// سندات الصرف
export const paymentVouchers = mysqlTable("payment_vouchers", {
  id: int("id").primaryKey().autoincrement(),
  voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
  voucherDate: datetime("voucher_date").notNull(),
  
  // الربط بالهيكلية
  unitId: int("unit_id").notNull(),
  organizationId: int("organization_id").notNull(),
  branchId: int("branch_id"),
  
  // من/إلى
  fromAccountType: varchar("from_account_type", { length: 50 }).notNull(), // "fund", "bank", "cashier"
  fromAccountId: int("from_account_id").notNull(),
  toAccountType: varchar("to_account_type", { length: 50 }).notNull(), // "supplier", "fund", "expense"
  toAccountId: int("to_account_id").notNull(),
  
  // المبلغ
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currencyId: int("currency_id").notNull(),
  
  // الربط بالقيد
  journalEntryId: int("journal_entry_id"),
  
  description: text("description"),
  status: varchar("status", { length: 20 }).default("draft"),
  
  createdBy: int("created_by").notNull(),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueNumberPerOrg: unique().on(table.voucherNumber, table.organizationId),
  unitIdx: index("unit_idx").on(table.unitId),
  orgIdx: index("org_idx").on(table.organizationId),
  dateIdx: index("date_idx").on(table.voucherDate),
}));

// ============ الحسابات الوسيطة (Intermediary Accounts) ============

// للربط بين الوحدات/المؤسسات/الفروع
export const intermediaryAccounts = mysqlTable("intermediary_accounts", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  
  // الطرف الأول
  fromType: varchar("from_type", { length: 20 }).notNull(), // "unit", "organization", "branch"
  fromId: int("from_id").notNull(),
  
  // الطرف الثاني
  toType: varchar("to_type", { length: 20 }).notNull(),
  toId: int("to_id").notNull(),
  
  // الربط بدليل الحسابات
  chartAccountId: int("chart_account_id"),
  
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: tinyint("is_active").default(1),
  
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
