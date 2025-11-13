import { mysqlTable, varchar, int, datetime, tinyint, text, decimal, json } from "drizzle-orm/mysql-core";

// ====================================
// Core Database Schema
// قاعدة البيانات الأساسية المشتركة
// ====================================

// ============ إدارة المستخدمين ============

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user"),
  unitId: int("unit_id"),
  organizationId: int("organization_id"),
  branchId: int("branch_id"),
  isActive: tinyint("is_active").default(1),
  lastLogin: datetime("last_login"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// ============ الهيكلية الهرمية ============

// الوحدات المحاسبية (أعلى مستوى)
export const units = mysqlTable("units", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// المؤسسات (مستوى ثاني)
export const organizations = mysqlTable("organizations", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  unitId: int("unit_id").notNull().references(() => units.id),
  description: text("description"),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// الفروع (أدنى مستوى)
export const branches = mysqlTable("branches", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  organizationId: int("organization_id").notNull().references(() => organizations.id),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// ============ العملات ============

export const currencies = mysqlTable("currencies", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1.0000"),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// ============ سجل الوحدات (Module Registry) ============

export const moduleRegistry = mysqlTable("module_registry", {
  id: int("id").primaryKey().autoincrement(),
  moduleId: varchar("module_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  isInstalled: tinyint("is_installed").default(0),
  isEnabled: tinyint("is_enabled").default(0),
  isRequired: tinyint("is_required").default(0),
  dependencies: json("dependencies"), // ["core", "accounting"]
  databaseName: varchar("database_name", { length: 100 }),
  config: json("config"),
  installedAt: datetime("installed_at"),
  enabledAt: datetime("enabled_at"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// ============ المعاملات بين الوحدات ============

export const interUnitTransactions = mysqlTable("inter_unit_transactions", {
  id: int("id").primaryKey().autoincrement(),
  fromUnitId: int("from_unit_id").notNull().references(() => units.id),
  toUnitId: int("to_unit_id").notNull().references(() => units.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  intermediaryAccountId: int("intermediary_account_id"),
  description: text("description"),
  transactionDate: datetime("transaction_date").notNull(),
  createdBy: int("created_by").references(() => users.id),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ============ سجل الأحداث (Event Log) ============

export const eventLog = mysqlTable("event_log", {
  id: int("id").primaryKey().autoincrement(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // "user.created", "invoice.paid"
  moduleId: varchar("module_id", { length: 50 }).notNull(),
  payload: json("payload"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, processed, failed
  processedAt: datetime("processed_at"),
  errorMessage: text("error_message"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ============ سجل التدقيق (Audit Log) ============

export const auditLog = mysqlTable("audit_log", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  moduleId: varchar("module_id", { length: 50 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // "create", "update", "delete"
  entityType: varchar("entity_type", { length: 50 }), // "invoice", "user"
  entityId: int("entity_id"),
  oldValue: json("old_value"),
  newValue: json("new_value"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ============ الصلاحيات (Permissions) ============

export const roles = mysqlTable("roles", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  permissions: json("permissions"), // ["user.create", "invoice.read"]
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const userRoles = mysqlTable("user_roles", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  roleId: int("role_id").notNull().references(() => roles.id),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ============ إعدادات النظام ============

export const systemSettings = mysqlTable("system_settings", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  type: varchar("type", { length: 20 }).default("string"), // string, number, boolean, json
  description: text("description"),
  isPublic: tinyint("is_public").default(0),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// ============ Helper for SQL ============
import { sql } from "drizzle-orm";
