/**
 * ========================================
 * المرحلة 2: جداول الوحدة المحاسبية (Accounting Module Tables)
 * ========================================
 * 
 * مدمج من 4 مشاريع رئيسية:
 * - alabasi-system-5
 * - smart-accounting
 * - accounting-system
 * - al-mahaam-al-thaki-first
 */

import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar, 
  boolean, 
  decimal, 
  index, 
  unique,
  json
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// استيراد الجداول الأساسية
import { users, units, organizations, branches, currencies } from "./unified-schema-part1";

/**
 * دليل الحسابات الموحد (Chart of Accounts)
 * مدمج من 4 مشاريع
 * يدعم Multi-Tenant و الهيكل الهرمي
 */
export const chartOfAccounts = mysqlTable("chart_of_accounts", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط بالمؤسسة (حسب الهيكلية المعمارية)
  institutionId: int("institutionId").references(() => organizations.id).notNull(),
  unitId: int("unitId").references(() => units.id),
  
  // معلومات الحساب
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  
  // الهيكل الهرمي
  parentAccountId: int("parentAccountId"),
  level: int("level").default(1).notNull(),
  
  // نوع الحساب
  accountType: mysqlEnum("accountType", [
    "assets",          // أصول
    "liabilities",     // خصوم
    "equity",          // حقوق الملكية
    "revenue",         // إيرادات
    "expenses",        // مصروفات
    "intermediate"     // حساب وسيط
  ]),
  
  // نوع الحساب التحليلي
  analyticalType: mysqlEnum("analyticalType", [
    "fund",           // صندوق
    "bank",           // بنك
    "cashier",        // صراف
    "wallet",         // محفظة
    "customer",       // عميل
    "supplier",       // مورد
    "warehouse",      // مخزن
    "employee",       // موظف
    "none"            // بدون
  ]).default("none"),
  
  // العملات المفضلة (JSON Array)
  preferredCurrencies: json("preferredCurrencies").$type<number[]>(), // array of currency IDs
  
  // خصائص الحساب
  isParent: boolean("isParent").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  allowDirectPosting: boolean("allowDirectPosting").default(true).notNull(),
  
  // معلومات إضافية
  description: text("description"),
  notes: text("notes"),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  institutionIdx: index("institution_idx").on(table.institutionId),
  parentIdx: index("parent_account_idx").on(table.parentAccountId),
  codeInstitutionUnique: unique("code_institution_unique").on(table.code, table.institutionId),
  accountTypeIdx: index("account_type_idx").on(table.accountType),
  analyticalTypeIdx: index("analytical_type_idx").on(table.analyticalType),
}));

export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = typeof chartOfAccounts.$inferInsert;

/**
 * الحسابات التحليلية الموحدة (Analytical Accounts)
 * مدمج من 4 مشاريع
 * يشمل: الصناديق، البنوك، الصرافين، المحافظ، العملاء، الموردين
 */
export const analyticalAccounts = mysqlTable("analytical_accounts", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط بدليل الحسابات
  chartAccountId: int("chartAccountId").references(() => chartOfAccounts.id).notNull(),
  institutionId: int("institutionId").references(() => organizations.id).notNull(),
  unitId: int("unitId").references(() => units.id),
  
  // معلومات الحساب
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  
  // نوع الحساب التحليلي (مطابق لـ analyticalType في دليل الحسابات)
  type: mysqlEnum("type", [
    "fund",
    "bank",
    "cashier",
    "wallet",
    "customer",
    "supplier",
    "warehouse",
    "employee"
  ]).notNull(),
  
  // العملات المدعومة (مأخوذة من الحساب الرئيسي)
  supportedCurrencies: json("supportedCurrencies").$type<number[]>(),
  
  // معلومات إضافية حسب النوع
  accountNumber: varchar("accountNumber", { length: 100 }), // للبنوك
  iban: varchar("iban", { length: 34 }), // للبنوك
  swiftCode: varchar("swiftCode", { length: 11 }), // للبنوك
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  
  // معلومات ضريبية (للعملاء والموردين)
  taxNumber: varchar("taxNumber", { length: 50 }),
  
  // الحالة
  isActive: boolean("isActive").default(true).notNull(),
  
  // معلومات إضافية
  notes: text("notes"),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  chartAccountIdx: index("chart_account_idx").on(table.chartAccountId),
  institutionIdx: index("institution_idx").on(table.institutionId),
  typeIdx: index("type_idx").on(table.type),
  codeInstitutionUnique: unique("code_institution_unique").on(table.code, table.institutionId),
}));

export type AnalyticalAccount = typeof analyticalAccounts.$inferSelect;
export type InsertAnalyticalAccount = typeof analyticalAccounts.$inferInsert;

/**
 * القيود اليومية (Journal Entries)
 * مدمج من 4 مشاريع
 */
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط
  institutionId: int("institutionId").references(() => organizations.id).notNull(),
  unitId: int("unitId").references(() => units.id),
  branchId: int("branchId").references(() => branches.id),
  
  // معلومات القيد
  entryNumber: varchar("entryNumber", { length: 50 }).notNull(),
  entryDate: timestamp("entryDate").notNull(),
  
  // نوع القيد
  entryType: mysqlEnum("entryType", [
    "manual",          // قيد يدوي
    "opening",         // قيد افتتاحي
    "closing",         // قيد إقفال
    "adjustment",      // قيد تسوية
    "reversal",        // قيد عكسي
    "automated"        // قيد تلقائي
  ]).default("manual").notNull(),
  
  // الوصف
  description: text("description").notNull(),
  reference: varchar("reference", { length: 100 }),
  
  // الحالة
  status: mysqlEnum("status", [
    "draft",           // مسودة
    "pending",         // معلق
    "approved",        // معتمد
    "posted",          // مرحل
    "cancelled"        // ملغى
  ]).default("draft").notNull(),
  
  // معلومات الاعتماد
  approvedBy: int("approvedBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  
  // معلومات الترحيل
  postedBy: int("postedBy").references(() => users.id),
  postedAt: timestamp("postedAt"),
  
  // المرفقات
  attachments: json("attachments").$type<string[]>(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  institutionIdx: index("institution_idx").on(table.institutionId),
  entryNumberIdx: index("entry_number_idx").on(table.entryNumber),
  entryDateIdx: index("entry_date_idx").on(table.entryDate),
  statusIdx: index("status_idx").on(table.status),
}));

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * تفاصيل القيود اليومية (Journal Entry Lines)
 * مدمج من 4 مشاريع
 */
export const journalEntryLines = mysqlTable("journal_entry_lines", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط بالقيد
  journalEntryId: int("journalEntryId").references(() => journalEntries.id).notNull(),
  
  // الارتباط بالحساب
  chartAccountId: int("chartAccountId").references(() => chartOfAccounts.id).notNull(),
  analyticalAccountId: int("analyticalAccountId").references(() => analyticalAccounts.id),
  
  // المبالغ
  debit: decimal("debit", { precision: 15, scale: 2 }).default("0.00").notNull(),
  credit: decimal("credit", { precision: 15, scale: 2 }).default("0.00").notNull(),
  
  // العملة
  currencyId: int("currencyId").references(() => currencies.id).notNull(),
  exchangeRate: decimal("exchangeRate", { precision: 10, scale: 4 }).default("1.0000").notNull(),
  
  // المبالغ بالعملة الأساسية
  debitBase: decimal("debitBase", { precision: 15, scale: 2 }).default("0.00").notNull(),
  creditBase: decimal("creditBase", { precision: 15, scale: 2 }).default("0.00").notNull(),
  
  // الوصف
  description: text("description"),
  
  // مركز التكلفة
  costCenterId: int("costCenterId"),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  journalEntryIdx: index("journal_entry_idx").on(table.journalEntryId),
  chartAccountIdx: index("chart_account_idx").on(table.chartAccountId),
  analyticalAccountIdx: index("analytical_account_idx").on(table.analyticalAccountId),
}));

export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertJournalEntryLine = typeof journalEntryLines.$inferInsert;

/**
 * السندات الموحدة (Vouchers)
 * مدمج من 3 مشاريع
 * يشمل: سندات القبض وسندات الصرف
 */
export const vouchers = mysqlTable("vouchers", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط
  institutionId: int("institutionId").references(() => organizations.id).notNull(),
  unitId: int("unitId").references(() => units.id),
  branchId: int("branchId").references(() => branches.id),
  
  // نوع السند
  voucherType: mysqlEnum("voucherType", [
    "receipt",         // سند قبض
    "payment"          // سند صرف
  ]).notNull(),
  
  // معلومات السند
  voucherNumber: varchar("voucherNumber", { length: 50 }).notNull(),
  voucherDate: timestamp("voucherDate").notNull(),
  
  // الحسابات
  fromAccountId: int("fromAccountId").references(() => analyticalAccounts.id).notNull(),
  toAccountId: int("toAccountId").references(() => analyticalAccounts.id).notNull(),
  
  // المبلغ
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currencyId: int("currencyId").references(() => currencies.id).notNull(),
  
  // الوصف
  description: text("description").notNull(),
  payee: varchar("payee", { length: 200 }), // المستفيد
  
  // الارتباط بالقيد اليومي
  journalEntryId: int("journalEntryId").references(() => journalEntries.id),
  
  // الحالة
  status: mysqlEnum("status", [
    "draft",
    "approved",
    "posted",
    "cancelled"
  ]).default("draft").notNull(),
  
  // المرفقات
  attachments: json("attachments").$type<string[]>(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  institutionIdx: index("institution_idx").on(table.institutionId),
  voucherNumberIdx: index("voucher_number_idx").on(table.voucherNumber),
  voucherTypeIdx: index("voucher_type_idx").on(table.voucherType),
  voucherDateIdx: index("voucher_date_idx").on(table.voucherDate),
  statusIdx: index("status_idx").on(table.status),
}));

export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = typeof vouchers.$inferInsert;

// ========================================
// العلاقات (Relations) - الجزء 2
// ========================================

export const chartOfAccountsRelations = relations(chartOfAccounts, ({ one, many }) => ({
  institution: one(organizations, {
    fields: [chartOfAccounts.institutionId],
    references: [organizations.id],
  }),
  unit: one(units, {
    fields: [chartOfAccounts.unitId],
    references: [units.id],
  }),
  parent: one(chartOfAccounts, {
    fields: [chartOfAccounts.parentAccountId],
    references: [chartOfAccounts.id],
  }),
  children: many(chartOfAccounts),
  analyticalAccounts: many(analyticalAccounts),
  journalEntryLines: many(journalEntryLines),
  creator: one(users, {
    fields: [chartOfAccounts.createdBy],
    references: [users.id],
  }),
}));

export const analyticalAccountsRelations = relations(analyticalAccounts, ({ one, many }) => ({
  chartAccount: one(chartOfAccounts, {
    fields: [analyticalAccounts.chartAccountId],
    references: [chartOfAccounts.id],
  }),
  institution: one(organizations, {
    fields: [analyticalAccounts.institutionId],
    references: [organizations.id],
  }),
  unit: one(units, {
    fields: [analyticalAccounts.unitId],
    references: [units.id],
  }),
  journalEntryLines: many(journalEntryLines),
  vouchersFrom: many(vouchers, { relationName: "fromAccount" }),
  vouchersTo: many(vouchers, { relationName: "toAccount" }),
  creator: one(users, {
    fields: [analyticalAccounts.createdBy],
    references: [users.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  institution: one(organizations, {
    fields: [journalEntries.institutionId],
    references: [organizations.id],
  }),
  unit: one(units, {
    fields: [journalEntries.unitId],
    references: [units.id],
  }),
  branch: one(branches, {
    fields: [journalEntries.branchId],
    references: [branches.id],
  }),
  lines: many(journalEntryLines),
  vouchers: many(vouchers),
  creator: one(users, {
    fields: [journalEntries.createdBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [journalEntries.approvedBy],
    references: [users.id],
  }),
  poster: one(users, {
    fields: [journalEntries.postedBy],
    references: [users.id],
  }),
}));

export const journalEntryLinesRelations = relations(journalEntryLines, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalEntryLines.journalEntryId],
    references: [journalEntries.id],
  }),
  chartAccount: one(chartOfAccounts, {
    fields: [journalEntryLines.chartAccountId],
    references: [chartOfAccounts.id],
  }),
  analyticalAccount: one(analyticalAccounts, {
    fields: [journalEntryLines.analyticalAccountId],
    references: [analyticalAccounts.id],
  }),
  currency: one(currencies, {
    fields: [journalEntryLines.currencyId],
    references: [currencies.id],
  }),
}));

export const vouchersRelations = relations(vouchers, ({ one }) => ({
  institution: one(organizations, {
    fields: [vouchers.institutionId],
    references: [organizations.id],
  }),
  unit: one(units, {
    fields: [vouchers.unitId],
    references: [units.id],
  }),
  branch: one(branches, {
    fields: [vouchers.branchId],
    references: [branches.id],
  }),
  fromAccount: one(analyticalAccounts, {
    fields: [vouchers.fromAccountId],
    references: [analyticalAccounts.id],
    relationName: "fromAccount",
  }),
  toAccount: one(analyticalAccounts, {
    fields: [vouchers.toAccountId],
    references: [analyticalAccounts.id],
    relationName: "toAccount",
  }),
  currency: one(currencies, {
    fields: [vouchers.currencyId],
    references: [currencies.id],
  }),
  journalEntry: one(journalEntries, {
    fields: [vouchers.journalEntryId],
    references: [journalEntries.id],
  }),
  creator: one(users, {
    fields: [vouchers.createdBy],
    references: [users.id],
  }),
}));
