import { mysqlTable, int, varchar, text, timestamp, boolean, decimal, mysqlEnum } from 'drizzle-orm/mysql-core';

// ============================================
// النواة الأساسية (Core) - الجداول المشتركة
// ============================================

// العملات
export const currencies = mysqlTable('currencies', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 100 }).notNull(),
  nameEn: varchar('nameEn', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// الوحدات المحاسبية
export const units = mysqlTable('units', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
  createdBy: int('createdBy'),
});

// المؤسسات
export const organizations = mysqlTable('organizations', {
  id: int('id').primaryKey().autoincrement(),
  unitId: int('unitId').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  taxNumber: varchar('taxNumber', { length: 50 }),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 320 }),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
  createdBy: int('createdBy'),
});

// الفروع
export const branches = mysqlTable('branches', {
  id: int('id').primaryKey().autoincrement(),
  unitId: int('unitId').notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 200 }).notNull(),
  nameEn: varchar('nameEn', { length: 200 }),
  isMain: boolean('isMain').notNull().default(false),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// المستخدمون
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  passwordHash: varchar('passwordHash', { length: 255 }).notNull(),
  fullName: varchar('fullName', { length: 200 }).notNull(),
  role: mysqlEnum('role', ['admin', 'accountant', 'manager', 'user']).notNull().default('user'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  lastLogin: timestamp('lastLogin'),
});

// ============================================
// وحدة المحاسبة (Accounting Module)
// ============================================

// فئات الحسابات
export const accountCategories = mysqlTable('accountCategories', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 100 }).notNull(),
  nameEn: varchar('nameEn', { length: 100 }),
  type: mysqlEnum('type', ['asset', 'liability', 'equity', 'revenue', 'expense']).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// دليل الحسابات
export const chartOfAccounts = mysqlTable('chartOfAccounts', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 200 }).notNull(),
  nameEn: varchar('nameEn', { length: 200 }),
  parentId: int('parentId'),
  categoryId: int('categoryId'),
  level: int('level').notNull().default(1),
  isParent: boolean('isParent').notNull().default(false),
  isActive: boolean('isActive').notNull().default(true),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// ربط العملات بالحسابات
export const accountCurrencies = mysqlTable('accountCurrencies', {
  id: int('id').primaryKey().autoincrement(),
  accountId: int('accountId').notNull(),
  currencyId: int('currencyId').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// أنواع الحسابات التحليلية
export const analyticalAccountTypes = mysqlTable('analyticalAccountTypes', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 100 }).notNull(),
  nameEn: varchar('nameEn', { length: 100 }),
  icon: varchar('icon', { length: 50 }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// الحسابات التحليلية
export const analyticalAccounts = mysqlTable('analyticalAccounts', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 200 }).notNull(),
  nameEn: varchar('nameEn', { length: 200 }),
  chartAccountId: int('chartAccountId').notNull(),
  typeId: int('typeId').notNull(),
  branchId: int('branchId').notNull(),
  openingBalance: int('openingBalance').notNull().default(0),
  currentBalance: int('currentBalance').notNull().default(0),
  currencyId: int('currencyId').notNull(),
  isActive: boolean('isActive').notNull().default(true),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// القيود اليومية
export const journalEntries = mysqlTable('journalEntries', {
  id: int('id').primaryKey().autoincrement(),
  entryNumber: varchar('entryNumber', { length: 50 }).notNull().unique(),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  voucherId: int('voucherId'),
  branchId: int('branchId').notNull(),
  status: mysqlEnum('status', ['draft', 'posted', 'cancelled']).notNull().default('posted'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// بنود القيود اليومية
export const journalEntryLines = mysqlTable('journalEntryLines', {
  id: int('id').primaryKey().autoincrement(),
  entryId: int('entryId').notNull(),
  accountId: int('accountId').notNull(),
  type: mysqlEnum('type', ['debit', 'credit']).notNull(),
  amount: int('amount').notNull(),
  currencyId: int('currencyId').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// السندات (قبض وصرف)
export const vouchers = mysqlTable('vouchers', {
  id: int('id').primaryKey().autoincrement(),
  voucherNumber: varchar('voucherNumber', { length: 50 }).notNull().unique(),
  type: mysqlEnum('type', ['receipt', 'payment']).notNull(),
  voucherType: mysqlEnum('voucherType', ['cash', 'bank']).notNull(),
  date: timestamp('date').notNull(),
  amount: int('amount').notNull(),
  currencyId: int('currencyId').notNull(),
  fromAccountId: int('fromAccountId'),
  toAccountId: int('toAccountId'),
  branchId: int('branchId').notNull(),
  statement: text('statement').notNull(),
  referenceNumber: varchar('referenceNumber', { length: 100 }),
  attachmentUrl: text('attachmentUrl'),
  status: mysqlEnum('status', ['draft', 'approved', 'cancelled']).notNull().default('approved'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
  approvedAt: timestamp('approvedAt'),
  approvedBy: int('approvedBy'),
});

// ============================================
// وحدة المخزون (Inventory Module)
// ============================================

// المخازن
export const warehouses = mysqlTable('warehouses', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 200 }).notNull(),
  nameEn: varchar('nameEn', { length: 200 }),
  branchId: int('branchId').notNull(),
  address: text('address'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// فئات الأصناف
export const itemCategories = mysqlTable('itemCategories', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 200 }).notNull(),
  nameEn: varchar('nameEn', { length: 200 }),
  parentId: int('parentId'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// الأصناف/المنتجات
export const items = mysqlTable('items', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 200 }).notNull(),
  nameEn: varchar('nameEn', { length: 200 }),
  categoryId: int('categoryId').notNull(),
  barcode: varchar('barcode', { length: 50 }),
  unit: varchar('unit', { length: 50 }).notNull(),
  purchasePrice: decimal('purchasePrice', { precision: 15, scale: 2 }).notNull(),
  salePrice: decimal('salePrice', { precision: 15, scale: 2 }).notNull(),
  minStock: int('minStock').notNull().default(0),
  isActive: boolean('isActive').notNull().default(true),
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// حركات المخزون
export const stockMovements = mysqlTable('stockMovements', {
  id: int('id').primaryKey().autoincrement(),
  movementNumber: varchar('movementNumber', { length: 50 }).notNull().unique(),
  type: mysqlEnum('type', ['in', 'out', 'transfer', 'adjustment']).notNull(),
  date: timestamp('date').notNull(),
  warehouseId: int('warehouseId').notNull(),
  itemId: int('itemId').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).notNull(),
  unitPrice: decimal('unitPrice', { precision: 15, scale: 2 }),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }),
  referenceType: varchar('referenceType', { length: 50 }),
  referenceId: int('referenceId'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// ============================================
// وحدة المبيعات (Sales Module)
// ============================================

// عروض الأسعار
export const quotations = mysqlTable('quotations', {
  id: int('id').primaryKey().autoincrement(),
  quotationNumber: varchar('quotationNumber', { length: 50 }).notNull().unique(),
  date: timestamp('date').notNull(),
  customerId: int('customerId').notNull(),
  branchId: int('branchId').notNull(),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal('taxAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  discountAmount: decimal('discountAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  netAmount: decimal('netAmount', { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['draft', 'sent', 'accepted', 'rejected', 'expired']).notNull().default('draft'),
  validUntil: timestamp('validUntil'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// بنود عروض الأسعار
export const quotationItems = mysqlTable('quotationItems', {
  id: int('id').primaryKey().autoincrement(),
  quotationId: int('quotationId').notNull(),
  itemId: int('itemId').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).notNull(),
  unitPrice: decimal('unitPrice', { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
});

// فواتير المبيعات
export const salesInvoices = mysqlTable('salesInvoices', {
  id: int('id').primaryKey().autoincrement(),
  invoiceNumber: varchar('invoiceNumber', { length: 50 }).notNull().unique(),
  date: timestamp('date').notNull(),
  customerId: int('customerId').notNull(),
  branchId: int('branchId').notNull(),
  warehouseId: int('warehouseId').notNull(),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal('taxAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  discountAmount: decimal('discountAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  netAmount: decimal('netAmount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paidAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  remainingAmount: decimal('remainingAmount', { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['draft', 'posted', 'paid', 'cancelled']).notNull().default('draft'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// بنود فواتير المبيعات
export const salesInvoiceItems = mysqlTable('salesInvoiceItems', {
  id: int('id').primaryKey().autoincrement(),
  invoiceId: int('invoiceId').notNull(),
  itemId: int('itemId').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).notNull(),
  unitPrice: decimal('unitPrice', { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
});

// ============================================
// وحدة المشتريات (Purchases Module)
// ============================================

// طلبات الشراء
export const purchaseOrders = mysqlTable('purchaseOrders', {
  id: int('id').primaryKey().autoincrement(),
  orderNumber: varchar('orderNumber', { length: 50 }).notNull().unique(),
  date: timestamp('date').notNull(),
  supplierId: int('supplierId').notNull(),
  branchId: int('branchId').notNull(),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal('taxAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  discountAmount: decimal('discountAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  netAmount: decimal('netAmount', { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['draft', 'sent', 'received', 'cancelled']).notNull().default('draft'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// بنود طلبات الشراء
export const purchaseOrderItems = mysqlTable('purchaseOrderItems', {
  id: int('id').primaryKey().autoincrement(),
  orderId: int('orderId').notNull(),
  itemId: int('itemId').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).notNull(),
  unitPrice: decimal('unitPrice', { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
});

// فواتير المشتريات
export const purchaseInvoices = mysqlTable('purchaseInvoices', {
  id: int('id').primaryKey().autoincrement(),
  invoiceNumber: varchar('invoiceNumber', { length: 50 }).notNull().unique(),
  date: timestamp('date').notNull(),
  supplierId: int('supplierId').notNull(),
  branchId: int('branchId').notNull(),
  warehouseId: int('warehouseId').notNull(),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  taxAmount: decimal('taxAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  discountAmount: decimal('discountAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  netAmount: decimal('netAmount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paidAmount', { precision: 15, scale: 2 }).notNull().default('0'),
  remainingAmount: decimal('remainingAmount', { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['draft', 'posted', 'paid', 'cancelled']).notNull().default('draft'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// بنود فواتير المشتريات
export const purchaseInvoiceItems = mysqlTable('purchaseInvoiceItems', {
  id: int('id').primaryKey().autoincrement(),
  invoiceId: int('invoiceId').notNull(),
  itemId: int('itemId').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).notNull(),
  unitPrice: decimal('unitPrice', { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal('totalAmount', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
});

// ============================================
// وحدة إدارة الطاقة (Energy Management Module)
// ============================================

// المحطات
export const stations = mysqlTable('stations', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 200 }).notNull(),
  nameEn: varchar('nameEn', { length: 200 }),
  branchId: int('branchId').notNull(),
  capacity: decimal('capacity', { precision: 15, scale: 2 }).notNull(),
  location: text('location'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// الاشتراكات
export const subscriptions = mysqlTable('subscriptions', {
  id: int('id').primaryKey().autoincrement(),
  subscriptionNumber: varchar('subscriptionNumber', { length: 50 }).notNull().unique(),
  customerId: int('customerId').notNull(),
  stationId: int('stationId').notNull(),
  meterNumber: varchar('meterNumber', { length: 50 }).notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate'),
  status: mysqlEnum('status', ['active', 'suspended', 'terminated']).notNull().default('active'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// قراءات العدادات
export const meterReadings = mysqlTable('meterReadings', {
  id: int('id').primaryKey().autoincrement(),
  subscriptionId: int('subscriptionId').notNull(),
  readingDate: timestamp('readingDate').notNull(),
  previousReading: decimal('previousReading', { precision: 15, scale: 2 }).notNull(),
  currentReading: decimal('currentReading', { precision: 15, scale: 2 }).notNull(),
  consumption: decimal('consumption', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

// ============================================
// وحدة الذكاء الاصطناعي (AI Module)
// ============================================

// محادثات الذكاء الاصطناعي
export const aiConversations = mysqlTable('aiConversations', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('userId').notNull(),
  sessionId: varchar('sessionId', { length: 100 }).notNull(),
  message: text('message').notNull(),
  response: text('response').notNull(),
  context: text('context'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// سجل الأوامر
export const commandHistory = mysqlTable('command_history', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('userId').notNull(),
  command: text('command').notNull(),
  result: text('result'),
  status: mysqlEnum('status', ['success', 'failed', 'pending']).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// الأنماط المتعلمة
export const learnedPatterns = mysqlTable('learned_patterns', {
  id: int('id').primaryKey().autoincrement(),
  pattern: text('pattern').notNull(),
  action: text('action').notNull(),
  frequency: int('frequency').notNull().default(1),
  lastUsed: timestamp('lastUsed').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// ============================================
// جداول إضافية (Assets, Employees, Inventory, Clearing Accounts)
// ============================================

export const assets = mysqlTable('assets', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 200 }).notNull(),
  nameEn: varchar('nameEn', { length: 200 }),
  categoryId: int('categoryId'),
  purchaseDate: timestamp('purchaseDate').notNull(),
  purchasePrice: decimal('purchasePrice', { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal('currentValue', { precision: 15, scale: 2 }).notNull(),
  depreciationRate: decimal('depreciationRate', { precision: 5, scale: 2 }),
  branchId: int('branchId').notNull(),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

export const employees = mysqlTable('employees', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  fullName: varchar('fullName', { length: 200 }).notNull(),
  position: varchar('position', { length: 100 }),
  branchId: int('branchId').notNull(),
  salary: decimal('salary', { precision: 15, scale: 2 }).notNull(),
  hireDate: timestamp('hireDate').notNull(),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: int('createdBy'),
});

export const inventory = mysqlTable('inventory', {
  id: int('id').primaryKey().autoincrement(),
  warehouseId: int('warehouseId').notNull(),
  itemId: int('itemId').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 3 }).notNull().default('0'),
  lastUpdated: timestamp('lastUpdated').notNull().defaultNow().onUpdateNow(),
});

export const clearingAccounts = mysqlTable('clearingAccounts', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameAr: varchar('nameAr', { length: 200 }).notNull(),
  nameEn: varchar('nameEn', { length: 200 }),
  accountId: int('accountId').notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).notNull().default('0'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
