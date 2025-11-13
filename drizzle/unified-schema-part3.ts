/**
 * ========================================
 * المرحلة 3: جداول الوحدات المتخصصة (Specialized Modules Tables)
 * ========================================
 * 
 * تشمل:
 * - وحدة إدارة الطاقة (Power Management)
 * - وحدة الفوترة والعدادات (Billing & Metering)
 * - وحدة إنترنت الأشياء (IoT)
 * - وحدة الاتصالات (Communication)
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
  json,
  double
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// استيراد الجداول الأساسية
import { users, units, organizations, branches } from "./unified-schema-part1";

// ========================================
// وحدة إدارة الطاقة (Power Management Module)
// ========================================

/**
 * المحطات الكهربائية
 * مدمج من 3 مشاريع
 */
export const powerStations = mysqlTable("power_stations", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط
  unitId: int("unitId").references(() => units.id).notNull(),
  organizationId: int("organizationId").references(() => organizations.id),
  branchId: int("branchId").references(() => branches.id),
  
  // معلومات المحطة
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  
  // نوع المحطة
  stationType: mysqlEnum("stationType", [
    "diesel",          // ديزل
    "solar",           // طاقة شمسية
    "hybrid",          // هجين
    "grid"             // شبكة عامة
  ]).notNull(),
  
  // الموقع
  location: json("location").$type<{
    lat: number;
    lng: number;
    address?: string;
  }>(),
  
  // المواصفات
  capacity: decimal("capacity", { precision: 10, scale: 2 }), // بالكيلووات
  voltage: int("voltage"), // الجهد
  
  // الحالة
  status: mysqlEnum("status", [
    "active",
    "inactive",
    "maintenance",
    "faulty"
  ]).default("active").notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  
  // معلومات إضافية
  description: text("description"),
  notes: text("notes"),
  
  // التواريخ
  installationDate: timestamp("installationDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  unitIdx: index("unit_idx").on(table.unitId),
  stationTypeIdx: index("station_type_idx").on(table.stationType),
  statusIdx: index("status_idx").on(table.status),
}));

export type PowerStation = typeof powerStations.$inferSelect;
export type InsertPowerStation = typeof powerStations.$inferInsert;

/**
 * المولدات
 * مدمج من 2 مشاريع
 */
export const generators = mysqlTable("generators", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط بالمحطة
  stationId: int("stationId").references(() => powerStations.id).notNull(),
  
  // معلومات المولد
  code: varchar("code", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  
  // المواصفات
  capacity: decimal("capacity", { precision: 10, scale: 2 }).notNull(), // بالكيلووات
  fuelType: mysqlEnum("fuelType", ["diesel", "gasoline", "gas", "solar"]).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  serialNumber: varchar("serialNumber", { length: 100 }),
  
  // القراءات
  currentReading: decimal("currentReading", { precision: 10, scale: 2 }).default("0.00"),
  lastMaintenanceReading: decimal("lastMaintenanceReading", { precision: 10, scale: 2 }).default("0.00"),
  
  // الحالة
  status: mysqlEnum("status", [
    "running",
    "stopped",
    "maintenance",
    "faulty"
  ]).default("stopped").notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  
  // التواريخ
  installationDate: timestamp("installationDate"),
  lastMaintenanceDate: timestamp("lastMaintenanceDate"),
  nextMaintenanceDate: timestamp("nextMaintenanceDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  stationIdx: index("station_idx").on(table.stationId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Generator = typeof generators.$inferSelect;
export type InsertGenerator = typeof generators.$inferInsert;

// ========================================
// وحدة الفوترة والعدادات (Billing & Metering Module)
// ========================================

/**
 * المشتركين (العملاء)
 * مدمج من 4 مشاريع
 */
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط
  unitId: int("unitId").references(() => units.id).notNull(),
  organizationId: int("organizationId").references(() => organizations.id),
  branchId: int("branchId").references(() => branches.id),
  
  // معلومات المشترك
  code: varchar("code", { length: 50 }).notNull(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }),
  
  // نوع المشترك
  subscriberType: mysqlEnum("subscriberType", [
    "residential",     // سكني
    "commercial",      // تجاري
    "industrial",      // صناعي
    "government"       // حكومي
  ]).notNull(),
  
  // معلومات الاتصال
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  
  // الموقع
  location: json("location").$type<{
    lat: number;
    lng: number;
  }>(),
  
  // نوع الاشتراك
  subscriptionType: mysqlEnum("subscriptionType", [
    "prepaid",         // دفع مسبق
    "postpaid",        // دفع آجل
    "free"             // مجاني
  ]).default("postpaid").notNull(),
  
  // الحالة
  status: mysqlEnum("status", [
    "active",
    "suspended",
    "disconnected",
    "cancelled"
  ]).default("active").notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  
  // معلومات إضافية
  notes: text("notes"),
  
  // التواريخ
  subscriptionDate: timestamp("subscriptionDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  unitIdx: index("unit_idx").on(table.unitId),
  codeUnitUnique: unique("code_unit_unique").on(table.code, table.unitId),
  subscriberTypeIdx: index("subscriber_type_idx").on(table.subscriberType),
  statusIdx: index("status_idx").on(table.status),
}));

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

/**
 * العدادات
 * مدمج من 3 مشاريع
 */
export const meters = mysqlTable("meters", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط بالمشترك
  subscriberId: int("subscriberId").references(() => subscribers.id).notNull(),
  stationId: int("stationId").references(() => powerStations.id),
  
  // معلومات العداد
  meterNumber: varchar("meterNumber", { length: 50 }).notNull().unique(),
  
  // نوع العداد
  meterType: mysqlEnum("meterType", [
    "electric",        // كهرباء
    "water",           // مياه
    "gas",             // غاز
    "smart"            // ذكي
  ]).notNull(),
  
  // المواصفات
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  capacity: decimal("capacity", { precision: 10, scale: 2 }),
  
  // القراءات
  initialReading: decimal("initialReading", { precision: 10, scale: 2 }).default("0.00").notNull(),
  currentReading: decimal("currentReading", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // الحالة
  status: mysqlEnum("status", [
    "active",
    "inactive",
    "faulty",
    "replaced"
  ]).default("active").notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  
  // التواريخ
  installationDate: timestamp("installationDate"),
  lastReadingDate: timestamp("lastReadingDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  subscriberIdx: index("subscriber_idx").on(table.subscriberId),
  stationIdx: index("station_idx").on(table.stationId),
  meterTypeIdx: index("meter_type_idx").on(table.meterType),
  statusIdx: index("status_idx").on(table.status),
}));

export type Meter = typeof meters.$inferSelect;
export type InsertMeter = typeof meters.$inferInsert;

/**
 * قراءات العدادات
 * مدمج من 3 مشاريع
 */
export const meterReadings = mysqlTable("meter_readings", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط بالعداد
  meterId: int("meterId").references(() => meters.id).notNull(),
  
  // القراءة
  previousReading: decimal("previousReading", { precision: 10, scale: 2 }).notNull(),
  currentReading: decimal("currentReading", { precision: 10, scale: 2 }).notNull(),
  consumption: decimal("consumption", { precision: 10, scale: 2 }).notNull(),
  
  // التاريخ
  readingDate: timestamp("readingDate").notNull(),
  
  // نوع القراءة
  readingType: mysqlEnum("readingType", [
    "manual",          // يدوي
    "automatic",       // تلقائي
    "estimated"        // تقديري
  ]).default("manual").notNull(),
  
  // معلومات إضافية
  notes: text("notes"),
  image: varchar("image", { length: 255 }), // صورة القراءة
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  meterIdx: index("meter_idx").on(table.meterId),
  readingDateIdx: index("reading_date_idx").on(table.readingDate),
}));

export type MeterReading = typeof meterReadings.$inferSelect;
export type InsertMeterReading = typeof meterReadings.$inferInsert;

/**
 * الفواتير
 * مدمج من 4 مشاريع
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط
  subscriberId: int("subscriberId").references(() => subscribers.id).notNull(),
  unitId: int("unitId").references(() => units.id).notNull(),
  
  // معلومات الفاتورة
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  invoiceDate: timestamp("invoiceDate").notNull(),
  dueDate: timestamp("dueDate"),
  
  // الفترة
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // المبالغ
  consumption: decimal("consumption", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 4 }).notNull(),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 15, scale: 2 }).default("0.00").notNull(),
  discount: decimal("discount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  
  // الدفع
  paidAmount: decimal("paidAmount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  remainingAmount: decimal("remainingAmount", { precision: 15, scale: 2 }).notNull(),
  
  // الحالة
  status: mysqlEnum("status", [
    "draft",
    "issued",
    "paid",
    "partial",
    "overdue",
    "cancelled"
  ]).default("draft").notNull(),
  
  // معلومات إضافية
  notes: text("notes"),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id),
}, (table) => ({
  subscriberIdx: index("subscriber_idx").on(table.subscriberId),
  unitIdx: index("unit_idx").on(table.unitId),
  invoiceDateIdx: index("invoice_date_idx").on(table.invoiceDate),
  statusIdx: index("status_idx").on(table.status),
}));

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ========================================
// وحدة إنترنت الأشياء (IoT Module)
// ========================================

/**
 * الأجهزة الذكية
 * مدمج من 2 مشاريع
 */
export const iotDevices = mysqlTable("iot_devices", {
  id: int("id").autoincrement().primaryKey(),
  
  // الارتباط
  unitId: int("unitId").references(() => units.id).notNull(),
  stationId: int("stationId").references(() => powerStations.id),
  meterId: int("meterId").references(() => meters.id),
  
  // معلومات الجهاز
  deviceId: varchar("deviceId", { length: 100 }).notNull().unique(),
  deviceName: varchar("deviceName", { length: 200 }).notNull(),
  
  // نوع الجهاز
  deviceType: mysqlEnum("deviceType", [
    "sensor",          // حساس
    "controller",      // متحكم
    "gateway",         // بوابة
    "meter",           // عداد ذكي
    "camera"           // كاميرا
  ]).notNull(),
  
  // المواصفات
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  firmwareVersion: varchar("firmwareVersion", { length: 50 }),
  
  // الاتصال
  connectionType: mysqlEnum("connectionType", [
    "wifi",
    "ethernet",
    "lora",
    "zigbee",
    "bluetooth"
  ]),
  ipAddress: varchar("ipAddress", { length: 45 }),
  macAddress: varchar("macAddress", { length: 17 }),
  
  // الحالة
  status: mysqlEnum("status", [
    "online",
    "offline",
    "error",
    "maintenance"
  ]).default("offline").notNull(),
  
  isActive: boolean("isActive").default(true).notNull(),
  
  // آخر اتصال
  lastSeen: timestamp("lastSeen"),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  unitIdx: index("unit_idx").on(table.unitId),
  deviceTypeIdx: index("device_type_idx").on(table.deviceType),
  statusIdx: index("status_idx").on(table.status),
}));

export type IotDevice = typeof iotDevices.$inferSelect;
export type InsertIotDevice = typeof iotDevices.$inferInsert;

// ========================================
// وحدة الاتصالات (Communication Module)
// ========================================

/**
 * الرسائل
 * مدمج من 2 مشاريع
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  
  // المرسل والمستقبل
  senderId: int("senderId").references(() => users.id).notNull(),
  receiverId: int("receiverId").references(() => users.id),
  
  // نوع الرسالة
  messageType: mysqlEnum("messageType", [
    "direct",          // مباشرة
    "broadcast",       // إذاعة
    "notification"     // إشعار
  ]).default("direct").notNull(),
  
  // المحتوى
  subject: varchar("subject", { length: 200 }),
  content: text("content").notNull(),
  
  // المرفقات
  attachments: json("attachments").$type<string[]>(),
  
  // الحالة
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  senderIdx: index("sender_idx").on(table.senderId),
  receiverIdx: index("receiver_idx").on(table.receiverId),
  messageTypeIdx: index("message_type_idx").on(table.messageType),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * الإشعارات
 * مدمج من 2 مشاريع
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  
  // المستخدم
  userId: int("userId").references(() => users.id).notNull(),
  
  // نوع الإشعار
  notificationType: mysqlEnum("notificationType", [
    "info",
    "warning",
    "error",
    "success"
  ]).default("info").notNull(),
  
  // المحتوى
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  
  // الارتباط
  relatedEntity: varchar("relatedEntity", { length: 50 }), // invoice, voucher, etc.
  relatedEntityId: int("relatedEntityId"),
  
  // الحالة
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  notificationTypeIdx: index("notification_type_idx").on(table.notificationType),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ========================================
// العلاقات (Relations) - الجزء 3
// ========================================

export const powerStationsRelations = relations(powerStations, ({ one, many }) => ({
  unit: one(units, {
    fields: [powerStations.unitId],
    references: [units.id],
  }),
  organization: one(organizations, {
    fields: [powerStations.organizationId],
    references: [organizations.id],
  }),
  branch: one(branches, {
    fields: [powerStations.branchId],
    references: [branches.id],
  }),
  generators: many(generators),
  meters: many(meters),
  iotDevices: many(iotDevices),
  creator: one(users, {
    fields: [powerStations.createdBy],
    references: [users.id],
  }),
}));

export const generatorsRelations = relations(generators, ({ one }) => ({
  station: one(powerStations, {
    fields: [generators.stationId],
    references: [powerStations.id],
  }),
}));

export const subscribersRelations = relations(subscribers, ({ one, many }) => ({
  unit: one(units, {
    fields: [subscribers.unitId],
    references: [units.id],
  }),
  organization: one(organizations, {
    fields: [subscribers.organizationId],
    references: [organizations.id],
  }),
  branch: one(branches, {
    fields: [subscribers.branchId],
    references: [branches.id],
  }),
  meters: many(meters),
  invoices: many(invoices),
  creator: one(users, {
    fields: [subscribers.createdBy],
    references: [users.id],
  }),
}));

export const metersRelations = relations(meters, ({ one, many }) => ({
  subscriber: one(subscribers, {
    fields: [meters.subscriberId],
    references: [subscribers.id],
  }),
  station: one(powerStations, {
    fields: [meters.stationId],
    references: [powerStations.id],
  }),
  readings: many(meterReadings),
  iotDevices: many(iotDevices),
}));

export const meterReadingsRelations = relations(meterReadings, ({ one }) => ({
  meter: one(meters, {
    fields: [meterReadings.meterId],
    references: [meters.id],
  }),
  creator: one(users, {
    fields: [meterReadings.createdBy],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  subscriber: one(subscribers, {
    fields: [invoices.subscriberId],
    references: [subscribers.id],
  }),
  unit: one(units, {
    fields: [invoices.unitId],
    references: [units.id],
  }),
  creator: one(users, {
    fields: [invoices.createdBy],
    references: [users.id],
  }),
}));

export const iotDevicesRelations = relations(iotDevices, ({ one }) => ({
  unit: one(units, {
    fields: [iotDevices.unitId],
    references: [units.id],
  }),
  station: one(powerStations, {
    fields: [iotDevices.stationId],
    references: [powerStations.id],
  }),
  meter: one(meters, {
    fields: [iotDevices.meterId],
    references: [meters.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
