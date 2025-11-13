import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { mysqlTable, varchar, int, datetime, tinyint } from "drizzle-orm/mysql-core";

// ====================================
// Core Module Schema
// الوحدة الأساسية (إجبارية)
// ====================================

// جدول المستخدمين
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user"),
  unitId: int("unit_id"),
  organizationId: int("organization_id"),
  branchId: int("branch_id"),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(new Date()),
  updatedAt: datetime("updated_at").notNull().default(new Date()),
});

// جدول الوحدات المحاسبية
export const units = mysqlTable("units", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(new Date()),
  updatedAt: datetime("updated_at").notNull().default(new Date()),
});

// جدول المؤسسات
export const organizations = mysqlTable("organizations", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  unitId: int("unit_id").notNull(),
  description: text("description"),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(new Date()),
  updatedAt: datetime("updated_at").notNull().default(new Date()),
});

// جدول الفروع
export const branches = mysqlTable("branches", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  organizationId: int("organization_id").notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(new Date()),
  updatedAt: datetime("updated_at").notNull().default(new Date()),
});

// جدول العملات
export const currencies = mysqlTable("currencies", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }),
  exchangeRate: int("exchange_rate").default(1),
  isActive: tinyint("is_active").default(1),
  createdAt: datetime("created_at").notNull().default(new Date()),
  updatedAt: datetime("updated_at").notNull().default(new Date()),
});
