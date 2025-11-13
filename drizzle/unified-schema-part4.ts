/**
 * ========================================
 * المرحلة 4: جداول الذكاء الاصطناعي (AI Module Tables)
 * ========================================
 * 
 * مدمج من alabasi-system-5
 * يشمل: المحادثات، السجلات، القدرات الذكية
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
import { users, units } from "./unified-schema-part1";

// ========================================
// جداول الذكاء الاصطناعي (AI Tables)
// ========================================

/**
 * المحادثات مع المساعد الذكي
 */
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  
  // المستخدم
  userId: int("userId").references(() => users.id).notNull(),
  unitId: int("unitId").references(() => units.id),
  
  // معلومات المحادثة
  title: varchar("title", { length: 200 }),
  
  // نوع المحادثة
  conversationType: mysqlEnum("conversationType", [
    "general",         // عام
    "accounting",      // محاسبي
    "analysis",        // تحليلي
    "reporting",       // تقارير
    "support"          // دعم فني
  ]).default("general").notNull(),
  
  // الحالة
  status: mysqlEnum("status", [
    "active",
    "archived",
    "deleted"
  ]).default("active").notNull(),
  
  // إحصائيات
  messageCount: int("messageCount").default(0).notNull(),
  
  // التواريخ
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  conversationTypeIdx: index("conversation_type_idx").on(table.conversationType),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;

/**
 * رسائل المحادثات
 */
export const aiMessages = mysqlTable("ai_messages", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط بالمحادثة
  conversationId: int("conversationId").references(() => aiConversations.id).notNull(),
  
  // المرسل
  role: mysqlEnum("role", [
    "user",            // المستخدم
    "assistant",       // المساعد الذكي
    "system"           // النظام
  ]).notNull(),
  
  // المحتوى
  content: text("content").notNull(),
  
  // معلومات إضافية
  metadata: json("metadata").$type<{
    model?: string;
    tokens?: number;
    cost?: number;
    attachments?: string[];
  }>(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index("conversation_idx").on(table.conversationId),
  roleIdx: index("role_idx").on(table.role),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiMessage = typeof aiMessages.$inferInsert;

/**
 * قدرات المساعد الذكي (AI Capabilities)
 */
export const aiCapabilities = mysqlTable("ai_capabilities", {
  id: int("id").autoincrement().primaryKey(),
  
  // معلومات القدرة
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  
  // نوع القدرة
  capabilityType: mysqlEnum("capabilityType", [
    "accounting",      // محاسبية
    "analysis",        // تحليلية
    "reporting",       // تقارير
    "automation",      // أتمتة
    "prediction",      // تنبؤ
    "recommendation",  // توصيات
    "testing",         // اختبار
    "support"          // دعم
  ]).notNull(),
  
  // الأيقونة
  icon: varchar("icon", { length: 100 }),
  
  // الحالة
  isActive: boolean("isActive").default(true).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  
  // الترتيب
  sortOrder: int("sortOrder").default(0).notNull(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  capabilityTypeIdx: index("capability_type_idx").on(table.capabilityType),
  sortOrderIdx: index("sort_order_idx").on(table.sortOrder),
}));

export type AiCapability = typeof aiCapabilities.$inferSelect;
export type InsertAiCapability = typeof aiCapabilities.$inferInsert;

/**
 * سجل استخدام القدرات الذكية
 */
export const aiCapabilityUsage = mysqlTable("ai_capability_usage", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط
  capabilityId: int("capabilityId").references(() => aiCapabilities.id).notNull(),
  userId: int("userId").references(() => users.id).notNull(),
  conversationId: int("conversationId").references(() => aiConversations.id),
  
  // معلومات الاستخدام
  input: json("input").$type<any>(),
  output: json("output").$type<any>(),
  
  // الحالة
  status: mysqlEnum("status", [
    "success",
    "failed",
    "pending"
  ]).notNull(),
  
  // معلومات الأداء
  executionTime: int("executionTime"), // بالميلي ثانية
  errorMessage: text("errorMessage"),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  capabilityIdx: index("capability_idx").on(table.capabilityId),
  userIdx: index("user_idx").on(table.userId),
  conversationIdx: index("conversation_idx").on(table.conversationId),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type AiCapabilityUsage = typeof aiCapabilityUsage.$inferSelect;
export type InsertAiCapabilityUsage = typeof aiCapabilityUsage.$inferInsert;

/**
 * تقارير الاختبار التلقائي
 * لأتمتة اختبار الإضافات الجديدة
 */
export const aiTestReports = mysqlTable("ai_test_reports", {
  id: int("id").autoincrement().primaryKey(),
  
  // معلومات الاختبار
  testName: varchar("testName", { length: 200 }).notNull(),
  testType: mysqlEnum("testType", [
    "unit",            // وحدة
    "integration",     // تكامل
    "e2e",             // شامل
    "regression"       // انحدار
  ]).notNull(),
  
  // الهدف
  targetEntity: varchar("targetEntity", { length: 100 }), // اسم الواجهة أو المكون
  targetVersion: varchar("targetVersion", { length: 50 }),
  
  // النتائج
  status: mysqlEnum("status", [
    "passed",
    "failed",
    "warning"
  ]).notNull(),
  
  totalTests: int("totalTests").notNull(),
  passedTests: int("passedTests").notNull(),
  failedTests: int("failedTests").notNull(),
  
  // التفاصيل
  details: json("details").$type<{
    tests: Array<{
      name: string;
      status: "passed" | "failed" | "warning";
      message?: string;
      duration?: number;
    }>;
  }>(),
  
  // معلومات الأداء
  executionTime: int("executionTime"), // بالميلي ثانية
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  testTypeIdx: index("test_type_idx").on(table.testType),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type AiTestReport = typeof aiTestReports.$inferSelect;
export type InsertAiTestReport = typeof aiTestReports.$inferInsert;

/**
 * سجل الأنشطة الذكية
 * لتتبع جميع العمليات التي يقوم بها الذكاء الاصطناعي
 */
export const aiActivityLog = mysqlTable("ai_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  
  // المستخدم
  userId: int("userId").references(() => users.id),
  
  // نوع النشاط
  activityType: mysqlEnum("activityType", [
    "conversation",    // محادثة
    "analysis",        // تحليل
    "report",          // تقرير
    "automation",      // أتمتة
    "test",            // اختبار
    "recommendation"   // توصية
  ]).notNull(),
  
  // الوصف
  description: text("description").notNull(),
  
  // البيانات
  data: json("data").$type<any>(),
  
  // الحالة
  status: mysqlEnum("status", [
    "success",
    "failed",
    "pending"
  ]).notNull(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  activityTypeIdx: index("activity_type_idx").on(table.activityType),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type AiActivityLog = typeof aiActivityLog.$inferSelect;
export type InsertAiActivityLog = typeof aiActivityLog.$inferInsert;

// ========================================
// العلاقات (Relations) - الجزء 4
// ========================================

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
  unit: one(units, {
    fields: [aiConversations.unitId],
    references: [units.id],
  }),
  messages: many(aiMessages),
  capabilityUsage: many(aiCapabilityUsage),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));

export const aiCapabilitiesRelations = relations(aiCapabilities, ({ many }) => ({
  usage: many(aiCapabilityUsage),
}));

export const aiCapabilityUsageRelations = relations(aiCapabilityUsage, ({ one }) => ({
  capability: one(aiCapabilities, {
    fields: [aiCapabilityUsage.capabilityId],
    references: [aiCapabilities.id],
  }),
  user: one(users, {
    fields: [aiCapabilityUsage.userId],
    references: [users.id],
  }),
  conversation: one(aiConversations, {
    fields: [aiCapabilityUsage.conversationId],
    references: [aiConversations.id],
  }),
}));

export const aiTestReportsRelations = relations(aiTestReports, ({ one }) => ({
  creator: one(users, {
    fields: [aiTestReports.createdBy],
    references: [users.id],
  }),
}));

export const aiActivityLogRelations = relations(aiActivityLog, ({ one }) => ({
  user: one(users, {
    fields: [aiActivityLog.userId],
    references: [users.id],
  }),
}));
