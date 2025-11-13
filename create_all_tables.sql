-- ============================================
-- إنشاء جميع الجداول للنظام الموحد
-- ============================================

-- حذف الجداول القديمة إذا كانت موجودة
SET FOREIGN_KEY_CHECKS = 0;

-- الجداول الجديدة
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS itemCategories;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS stockMovements;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS quotationItems;
DROP TABLE IF EXISTS salesInvoices;
DROP TABLE IF EXISTS salesInvoiceItems;
DROP TABLE IF EXISTS purchaseOrders;
DROP TABLE IF EXISTS purchaseOrderItems;
DROP TABLE IF EXISTS purchaseInvoices;
DROP TABLE IF EXISTS purchaseInvoiceItems;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS meterReadings;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- وحدة المخزون
-- ============================================

CREATE TABLE IF NOT EXISTS warehouses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  nameAr VARCHAR(200) NOT NULL,
  nameEn VARCHAR(200),
  branchId INT NOT NULL,
  address TEXT,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (branchId) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS itemCategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  nameAr VARCHAR(200) NOT NULL,
  nameEn VARCHAR(200),
  parentId INT,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES itemCategories(id)
);

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  nameAr VARCHAR(200) NOT NULL,
  nameEn VARCHAR(200),
  categoryId INT NOT NULL,
  barcode VARCHAR(50),
  unit VARCHAR(50) NOT NULL,
  purchasePrice DECIMAL(15,2) NOT NULL,
  salePrice DECIMAL(15,2) NOT NULL,
  minStock INT NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (categoryId) REFERENCES itemCategories(id)
);

CREATE TABLE IF NOT EXISTS stockMovements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movementNumber VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('in', 'out', 'transfer', 'adjustment') NOT NULL,
  date TIMESTAMP NOT NULL,
  warehouseId INT NOT NULL,
  itemId INT NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  unitPrice DECIMAL(15,2),
  totalAmount DECIMAL(15,2),
  referenceType VARCHAR(50),
  referenceId INT,
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (warehouseId) REFERENCES warehouses(id),
  FOREIGN KEY (itemId) REFERENCES items(id)
);

-- ============================================
-- وحدة المبيعات
-- ============================================

CREATE TABLE IF NOT EXISTS quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotationNumber VARCHAR(50) NOT NULL UNIQUE,
  date TIMESTAMP NOT NULL,
  customerId INT NOT NULL,
  branchId INT NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  taxAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  discountAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  netAmount DECIMAL(15,2) NOT NULL,
  status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') NOT NULL DEFAULT 'draft',
  validUntil TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (customerId) REFERENCES analyticalAccounts(id),
  FOREIGN KEY (branchId) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS quotationItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotationId INT NOT NULL,
  itemId INT NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  unitPrice DECIMAL(15,2) NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (quotationId) REFERENCES quotations(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES items(id)
);

CREATE TABLE IF NOT EXISTS salesInvoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
  date TIMESTAMP NOT NULL,
  customerId INT NOT NULL,
  branchId INT NOT NULL,
  warehouseId INT NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  taxAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  discountAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  netAmount DECIMAL(15,2) NOT NULL,
  paidAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  remainingAmount DECIMAL(15,2) NOT NULL,
  status ENUM('draft', 'posted', 'paid', 'cancelled') NOT NULL DEFAULT 'draft',
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (customerId) REFERENCES analyticalAccounts(id),
  FOREIGN KEY (branchId) REFERENCES branches(id),
  FOREIGN KEY (warehouseId) REFERENCES warehouses(id)
);

CREATE TABLE IF NOT EXISTS salesInvoiceItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceId INT NOT NULL,
  itemId INT NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  unitPrice DECIMAL(15,2) NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (invoiceId) REFERENCES salesInvoices(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES items(id)
);

-- ============================================
-- وحدة المشتريات
-- ============================================

CREATE TABLE IF NOT EXISTS purchaseOrders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderNumber VARCHAR(50) NOT NULL UNIQUE,
  date TIMESTAMP NOT NULL,
  supplierId INT NOT NULL,
  branchId INT NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  taxAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  discountAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  netAmount DECIMAL(15,2) NOT NULL,
  status ENUM('draft', 'sent', 'received', 'cancelled') NOT NULL DEFAULT 'draft',
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (supplierId) REFERENCES analyticalAccounts(id),
  FOREIGN KEY (branchId) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS purchaseOrderItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  itemId INT NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  unitPrice DECIMAL(15,2) NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (orderId) REFERENCES purchaseOrders(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES items(id)
);

CREATE TABLE IF NOT EXISTS purchaseInvoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
  date TIMESTAMP NOT NULL,
  supplierId INT NOT NULL,
  branchId INT NOT NULL,
  warehouseId INT NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  taxAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  discountAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  netAmount DECIMAL(15,2) NOT NULL,
  paidAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
  remainingAmount DECIMAL(15,2) NOT NULL,
  status ENUM('draft', 'posted', 'paid', 'cancelled') NOT NULL DEFAULT 'draft',
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (supplierId) REFERENCES analyticalAccounts(id),
  FOREIGN KEY (branchId) REFERENCES warehouses(id),
  FOREIGN KEY (warehouseId) REFERENCES warehouses(id)
);

CREATE TABLE IF NOT EXISTS purchaseInvoiceItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceId INT NOT NULL,
  itemId INT NOT NULL,
  quantity DECIMAL(15,3) NOT NULL,
  unitPrice DECIMAL(15,2) NOT NULL,
  totalAmount DECIMAL(15,2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (invoiceId) REFERENCES purchaseInvoices(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES items(id)
);

-- ============================================
-- وحدة إدارة الطاقة
-- ============================================

CREATE TABLE IF NOT EXISTS stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  nameAr VARCHAR(200) NOT NULL,
  nameEn VARCHAR(200),
  branchId INT NOT NULL,
  capacity DECIMAL(15,2) NOT NULL,
  location TEXT,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (branchId) REFERENCES branches(id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscriptionNumber VARCHAR(50) NOT NULL UNIQUE,
  customerId INT NOT NULL,
  stationId INT NOT NULL,
  meterNumber VARCHAR(50) NOT NULL,
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP,
  status ENUM('active', 'suspended', 'terminated') NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (customerId) REFERENCES analyticalAccounts(id),
  FOREIGN KEY (stationId) REFERENCES stations(id)
);

CREATE TABLE IF NOT EXISTS meterReadings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscriptionId INT NOT NULL,
  readingDate TIMESTAMP NOT NULL,
  previousReading DECIMAL(15,2) NOT NULL,
  currentReading DECIMAL(15,2) NOT NULL,
  consumption DECIMAL(15,2) NOT NULL,
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id)
);

SELECT '✅ تم إنشاء جميع الجداول بنجاح!' as status;
