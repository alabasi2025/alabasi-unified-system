import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, index, unique } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * العملات المدعومة في النظام
 */
export const currencies = mysqlTable("currencies", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // SAR, USD, EUR
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(), // ر.س, $, €
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = typeof currencies.$inferInsert;

/**
 * الفروع
 */
export const branches = mysqlTable("branches", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  isMain: boolean("isMain").default(false).notNull(), // الفرع الرئيسي
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
});

export type Branch = typeof branches.$inferSelect;
export type InsertBranch = typeof branches.$inferInsert;

/**
 * أنواع الحسابات الرئيسية (الأصول، الخصوم، الإيرادات، المصروفات، حقوق الملكية)
 */
export const accountCategories = mysqlTable("accountCategories", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }),
  type: mysqlEnum("type", ["asset", "liability", "equity", "revenue", "expense"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AccountCategory = typeof accountCategories.$inferSelect;
export type InsertAccountCategory = typeof accountCategories.$inferInsert;

/**
 * دليل الحسابات (Chart of Accounts) - هيكل شجري
 */
export const chartOfAccounts = mysqlTable("chartOfAccounts", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  parentId: int("parentId"), // للحسابات الفرعية
  categoryId: int("categoryId").references(() => accountCategories.id),
  level: int("level").default(1).notNull(), // مستوى الحساب في الشجرة
  isParent: boolean("isParent").default(false).notNull(), // حساب رئيسي أم فرعي
  isActive: boolean("isActive").default(true).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  parentIdx: index("parent_idx").on(table.parentId),
  categoryIdx: index("category_idx").on(table.categoryId),
}));

export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = typeof chartOfAccounts.$inferInsert;

/**
 * العملات المفضلة لكل حساب في الدليل
 */
export const accountCurrencies = mysqlTable("accountCurrencies", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull().references(() => chartOfAccounts.id, { onDelete: "cascade" }),
  currencyId: int("currencyId").notNull().references(() => currencies.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  accountIdx: index("account_idx").on(table.accountId),
  currencyIdx: index("currency_idx").on(table.currencyId),
}));

export type AccountCurrency = typeof accountCurrencies.$inferSelect;
export type InsertAccountCurrency = typeof accountCurrencies.$inferInsert;

/**
 * أنواع الحسابات التحليلية (صندوق، بنك، صراف، محفظة، عميل، مورد، مخزن)
 */
export const analyticalAccountTypes = mysqlTable("analyticalAccountTypes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }),
  icon: varchar("icon", { length: 50 }), // أيقونة من lucide-react
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticalAccountType = typeof analyticalAccountTypes.$inferSelect;
export type InsertAnalyticalAccountType = typeof analyticalAccountTypes.$inferInsert;

/**
 * الحسابات التحليلية (Analytical Accounts)
 * مرتبطة بحساب في دليل الحسابات وفرع محدد
 */
export const analyticalAccounts = mysqlTable("analyticalAccounts", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  chartAccountId: int("chartAccountId").notNull().references(() => chartOfAccounts.id),
  typeId: int("typeId").notNull().references(() => analyticalAccountTypes.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  openingBalance: int("openingBalance").default(0).notNull(), // الرصيد الافتتاحي بالقروش
  currentBalance: int("currentBalance").default(0).notNull(), // الرصيد الحالي بالقروش
  currencyId: int("currencyId").notNull().references(() => currencies.id),
  isActive: boolean("isActive").default(true).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  chartAccountIdx: index("chart_account_idx").on(table.chartAccountId),
  typeIdx: index("type_idx").on(table.typeId),
  branchIdx: index("branch_idx").on(table.branchId),
}));

export type AnalyticalAccount = typeof analyticalAccounts.$inferSelect;
export type InsertAnalyticalAccount = typeof analyticalAccounts.$inferInsert;

/**
 * السندات (قبض وصرف)
 */
export const vouchers = mysqlTable("vouchers", {
  id: int("id").autoincrement().primaryKey(),
  voucherNumber: varchar("voucherNumber", { length: 50 }).notNull().unique(),
  type: mysqlEnum("type", ["receipt", "payment"]).notNull(), // قبض أو صرف
  voucherType: mysqlEnum("voucherType", ["cash", "bank"]).notNull(), // نقدي أو بنكي
  date: timestamp("date").notNull(),
  amount: int("amount").notNull(), // المبلغ بالقروش
  currencyId: int("currencyId").notNull().references(() => currencies.id),
  fromAccountId: int("fromAccountId").references(() => analyticalAccounts.id), // الحساب المدين
  toAccountId: int("toAccountId").references(() => analyticalAccounts.id), // الحساب الدائن
  branchId: int("branchId").notNull().references(() => branches.id),
  statement: text("statement").notNull(), // البيان
  referenceNumber: varchar("referenceNumber", { length: 100 }), // رقم مرجعي (شيك، حوالة، إلخ)
  attachmentUrl: text("attachmentUrl"), // رابط صورة الفاتورة
  status: mysqlEnum("status", ["draft", "approved", "cancelled"]).default("approved").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy").references(() => users.id),
}, (table) => ({
  dateIdx: index("date_idx").on(table.date),
  typeIdx: index("type_idx").on(table.type),
  branchIdx: index("branch_idx").on(table.branchId),
  fromAccountIdx: index("from_account_idx").on(table.fromAccountId),
  toAccountIdx: index("to_account_idx").on(table.toAccountId),
}));

export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = typeof vouchers.$inferInsert;

/**
 * القيود اليومية (Journal Entries)
 * يتم إنشاؤها تلقائيًا من السندات أو يدويًا
 */
export const journalEntries = mysqlTable("journalEntries", {
  id: int("id").autoincrement().primaryKey(),
  entryNumber: varchar("entryNumber", { length: 50 }).notNull().unique(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  voucherId: int("voucherId").references(() => vouchers.id), // مرتبط بسند إن وُجد
  branchId: int("branchId").notNull().references(() => branches.id),
  status: mysqlEnum("status", ["draft", "posted", "cancelled"]).default("posted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  dateIdx: index("date_idx").on(table.date),
  voucherIdx: index("voucher_idx").on(table.voucherId),
  branchIdx: index("branch_idx").on(table.branchId),
}));

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * تفاصيل القيود اليومية (مدين ودائن)
 */
export const journalEntryLines = mysqlTable("journalEntryLines", {
  id: int("id").autoincrement().primaryKey(),
  entryId: int("entryId").notNull().references(() => journalEntries.id, { onDelete: "cascade" }),
  accountId: int("accountId").notNull().references(() => analyticalAccounts.id),
  type: mysqlEnum("type", ["debit", "credit"]).notNull(), // مدين أو دائن
  amount: int("amount").notNull(), // المبلغ بالقروش
  currencyId: int("currencyId").notNull().references(() => currencies.id),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  entryIdx: index("entry_idx").on(table.entryId),
  accountIdx: index("account_idx").on(table.accountId),
}));

export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertJournalEntryLine = typeof journalEntryLines.$inferInsert;

/**
 * الموظفون
 */
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  position: varchar("position", { length: 100 }),
  branchId: int("branchId").notNull().references(() => branches.id),
  salary: int("salary").notNull(), // الراتب بالقروش
  currencyId: int("currencyId").notNull().references(() => currencies.id),
  hireDate: timestamp("hireDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  branchIdx: index("branch_idx").on(table.branchId),
}));

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

/**
 * المخزون
 */
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  category: varchar("category", { length: 100 }),
  branchId: int("branchId").notNull().references(() => branches.id),
  quantity: int("quantity").default(0).notNull(),
  unitPrice: int("unitPrice").notNull(), // سعر الوحدة بالقروش
  currencyId: int("currencyId").notNull().references(() => currencies.id),
  minQuantity: int("minQuantity").default(0), // الحد الأدنى للكمية
  isActive: boolean("isActive").default(true).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  branchIdx: index("branch_idx").on(table.branchId),
}));

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * الأصول الثابتة
 */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  category: varchar("category", { length: 100 }),
  branchId: int("branchId").notNull().references(() => branches.id),
  purchaseDate: timestamp("purchaseDate").notNull(),
  purchasePrice: int("purchasePrice").notNull(), // سعر الشراء بالقروش
  currentValue: int("currentValue").notNull(), // القيمة الحالية بالقروش
  currencyId: int("currencyId").notNull().references(() => currencies.id),
  depreciationRate: int("depreciationRate").default(0), // نسبة الإهلاك (بالنسبة المئوية × 100)
  isActive: boolean("isActive").default(true).notNull(),
  description: text("description"),
  serialNumber: varchar("serialNumber", { length: 100 }),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  branchIdx: index("branch_idx").on(table.branchId),
}));

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/**
 * سجل محادثات المساعد الذكي
 */
export const aiConversations = mysqlTable("aiConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  action: varchar("action", { length: 100 }), // نوع الإجراء (create_voucher, create_account, etc.)
  actionData: text("actionData"), // JSON للبيانات المنفذة
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

/**
 * الوحدات - Units (المستوى الأعلى في الهيكلية)
 */
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
});

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

/**
 * المؤسسات - Organizations (مستوى وسيط بين الوحدات والفروع)
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unitId").notNull().references(() => units.id),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  taxNumber: varchar("taxNumber", { length: 50 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  unitIdIdx: index("unitId_idx").on(table.unitId),
  codeUnitUnique: unique("code_unit_unique").on(table.code, table.unitId),
}));

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * الحسابات الوسيطة - Clearing Accounts
 * للربط بين الوحدات/المؤسسات/الفروع
 */
export const clearingAccounts = mysqlTable("clearingAccounts", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull().references(() => analyticalAccounts.id),
  clearingType: mysqlEnum("clearingType", [
    "inter_branch",
    "inter_organization",
    "inter_unit"
  ]).notNull(),
  entity1Type: mysqlEnum("entity1Type", ["branch", "organization", "unit"]).notNull(),
  entity1Id: int("entity1Id").notNull(),
  entity2Type: mysqlEnum("entity2Type", ["branch", "organization", "unit"]).notNull(),
  entity2Id: int("entity2Id").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  accountIdIdx: index("accountId_idx").on(table.accountId),
  entitiesUnique: unique("entities_unique").on(
    table.clearingType,
    table.entity1Type,
    table.entity1Id,
    table.entity2Type,
    table.entity2Id
  ),
}));

export type ClearingAccount = typeof clearingAccounts.$inferSelect;
export type InsertClearingAccount = typeof clearingAccounts.$inferInsert;

/**
 * الأنماط المتعلمة - Learned Patterns (للذكاء الاصطناعي)
 */
export const learnedPatterns = mysqlTable("learned_patterns", {
  id: int("id").autoincrement().primaryKey(),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  accountId: int("accountId").notNull().references(() => chartOfAccounts.id),
  frequency: int("frequency").default(1).notNull(),
  weight: int("weight").default(100).notNull(), // وزن الأهمية (0-100)
  lastUsed: timestamp("lastUsed").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  keywordIdx: index("keyword_idx").on(table.keyword),
  accountIdIdx: index("accountId_idx").on(table.accountId),
  keywordAccountUnique: unique("keyword_account_unique").on(table.keyword, table.accountId),
}));

export type LearnedPattern = typeof learnedPatterns.$inferSelect;
export type InsertLearnedPattern = typeof learnedPatterns.$inferInsert;

/**
 * سجل الأوامر - Command History
 */
export const commandHistory = mysqlTable("command_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  command: text("command").notNull(),
  commandType: mysqlEnum("commandType", [
    "create_unit",
    "create_organization",
    "create_branch",
    "create_chart",
    "create_analytical_account",
    "create_journal_entry",
    "create_payment_voucher",
    "create_receipt_voucher",
    "query_data",
    "generate_report",
    "other"
  ]).notNull(),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("pending").notNull(),
  result: text("result"), // JSON
  errorMessage: text("errorMessage"),
  executionTime: int("executionTime"), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
}));

export type CommandHistory = typeof commandHistory.$inferSelect;
export type InsertCommandHistory = typeof commandHistory.$inferInsert;
