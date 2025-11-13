/**
 * ========================================
 * نظام العباسي الموحد - مخطط قاعدة البيانات
 * Alabasi Unified System - Database Schema
 * ========================================
 * 
 * هذا الملف يحتوي على تعريفات الجداول الموحدة لنظام العباسي
 * تم تصميمه بناءً على استراتيجية دمج 207 جدول من 12 مشروعًا
 * 
 * البنية: Multi-Tenant Architecture with Unified Core
 * قاعدة البيانات: MySQL 8.0+ / TiDB
 * ORM: Drizzle ORM
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

// ========================================
// المرحلة 1: الجداول الأساسية الموحدة (Core Unified Tables)
// ========================================

/**
 * جدول المستخدمين الموحد
 * مدمج من 7 مشاريع
 * يدعم Multi-Tenant Architecture
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  
  // معلومات أساسية
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  
  // معلومات المصادقة
  loginMethod: varchar("loginMethod", { length: 64 }),
  password: varchar("password", { length: 255 }), // hashed
  
  // الصلاحيات والدور
  role: mysqlEnum("role", ["user", "admin", "manager", "accountant", "viewer"]).default("user").notNull(),
  
  // Multi-Tenant Support
  tenantId: int("tenantId"), // للفصل بين الوحدات
  defaultUnitId: int("defaultUnitId"), // الوحدة الافتراضية
  
  // صلاحيات الوحدات (JSON Array)
  moduleAccess: json("moduleAccess").$type<string[]>(), // ["accounting", "power", "billing", "iot"]
  
  // التفضيلات
  preferences: json("preferences").$type<{
    language?: string;
    theme?: string;
    notifications?: boolean;
  }>(),
  
  // الحالة
  isActive: boolean("isActive").default(true).notNull(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  tenantIdx: index("tenant_idx").on(table.tenantId),
  emailIdx: index("email_idx").on(table.email),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول الوحدات المحاسبية الموحد
 * مدمج من 5 مشاريع
 */
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  
  // معلومات أساسية
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  
  // نوع الوحدة
  moduleType: mysqlEnum("moduleType", [
    "accounting", 
    "power", 
    "billing", 
    "iot", 
    "communication",
    "hr",
    "inventory"
  ]).notNull(),
  
  // الهيكل الهرمي
  parentUnitId: int("parentUnitId"),
  
  // معلومات إضافية
  description: text("description"),
  address: text("address"),
  
  // الحالة
  isActive: boolean("isActive").default(true).notNull(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  moduleTypeIdx: index("module_type_idx").on(table.moduleType),
  parentIdx: index("parent_idx").on(table.parentUnitId),
}));

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

/**
 * جدول المؤسسات الموحد
 * مدمج من 5 مشاريع
 * يدعم الهيكل الهرمي
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  
  // معلومات أساسية
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  
  // الارتباط بالوحدة
  unitId: int("unitId").references(() => units.id),
  
  // نوع المؤسسة
  orgType: mysqlEnum("orgType", [
    "company",
    "branch",
    "department",
    "division",
    "project"
  ]).default("company").notNull(),
  
  // الهيكل الهرمي
  parentOrgId: int("parentOrgId"),
  
  // معلومات الاتصال
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  address: text("address"),
  
  // معلومات قانونية
  taxNumber: varchar("taxNumber", { length: 50 }),
  commercialRegister: varchar("commercialRegister", { length: 50 }),
  
  // الحالة
  isActive: boolean("isActive").default(true).notNull(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  unitIdx: index("unit_idx").on(table.unitId),
  parentIdx: index("parent_org_idx").on(table.parentOrgId),
  orgTypeIdx: index("org_type_idx").on(table.orgType),
}));

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * جدول الفروع الموحد
 * مدمج من 5 مشاريع
 */
export const branches = mysqlTable("branches", {
  id: int("id").autoincrement().primaryKey(),
  
  // معلومات أساسية
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  
  // الارتباطات
  organizationId: int("organizationId").references(() => organizations.id),
  unitId: int("unitId").references(() => units.id),
  
  // نوع الفرع
  branchType: mysqlEnum("branchType", [
    "main",
    "regional",
    "local",
    "warehouse",
    "office"
  ]).default("local").notNull(),
  
  // معلومات الموقع
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  country: varchar("country", { length: 100 }),
  
  // معلومات الاتصال
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  
  // الحالة
  isMain: boolean("isMain").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  orgIdx: index("org_idx").on(table.organizationId),
  unitIdx: index("unit_idx").on(table.unitId),
  branchTypeIdx: index("branch_type_idx").on(table.branchType),
}));

export type Branch = typeof branches.$inferSelect;
export type InsertBranch = typeof branches.$inferInsert;

/**
 * جدول العملات الموحد
 * مدمج من 4 مشاريع
 */
export const currencies = mysqlTable("currencies", {
  id: int("id").autoincrement().primaryKey(),
  
  // معلومات أساسية
  code: varchar("code", { length: 10 }).notNull().unique(), // SAR, USD, EUR
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(), // ر.س, $, €
  
  // معلومات إضافية
  decimalPlaces: int("decimalPlaces").default(2).notNull(),
  exchangeRate: decimal("exchangeRate", { precision: 10, scale: 4 }).default("1.0000"),
  
  // الحالة
  isActive: boolean("isActive").default(true).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = typeof currencies.$inferInsert;

// ========================================
// العلاقات (Relations) - الجزء 1
// ========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  defaultUnit: one(units, {
    fields: [users.defaultUnitId],
    references: [units.id],
  }),
  createdUnits: many(units),
  createdOrganizations: many(organizations),
  createdBranches: many(branches),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  parent: one(units, {
    fields: [units.parentUnitId],
    references: [units.id],
  }),
  children: many(units),
  organizations: many(organizations),
  branches: many(branches),
  creator: one(users, {
    fields: [units.createdBy],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  unit: one(units, {
    fields: [organizations.unitId],
    references: [units.id],
  }),
  parent: one(organizations, {
    fields: [organizations.parentOrgId],
    references: [organizations.id],
  }),
  children: many(organizations),
  branches: many(branches),
  creator: one(users, {
    fields: [organizations.createdBy],
    references: [users.id],
  }),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  organization: one(organizations, {
    fields: [branches.organizationId],
    references: [organizations.id],
  }),
  unit: one(units, {
    fields: [branches.unitId],
    references: [units.id],
  }),
  creator: one(users, {
    fields: [branches.createdBy],
    references: [users.id],
  }),
}));
