-- ============================================
-- بيانات تجريبية شاملة لجميع الوحدات
-- نظام العباسي الموحد
-- ============================================

-- البيانات التجريبية الموجودة مسبقًا (العملات، الوحدة، الفرع، دليل الحسابات، الحسابات التحليلية)
-- تم تحميلها من verified_test_data.sql

-- ============================================
-- بيانات وحدة المخزون
-- ============================================

-- المخازن
INSERT INTO warehouses (code, nameAr, nameEn, branchId, address, isActive, createdBy) VALUES
('WH001', 'المخزن الرئيسي', 'Main Warehouse', 1, 'صنعاء - شارع الزبيري', TRUE, 1),
('WH002', 'مخزن الفرع الثاني', 'Branch 2 Warehouse', 1, 'عدن - المعلا', TRUE, 1),
('WH003', 'مخزن قطع الغيار', 'Spare Parts Warehouse', 1, 'صنعاء - الحصبة', TRUE, 1);

-- فئات الأصناف
INSERT INTO itemCategories (code, nameAr, nameEn, parentId, isActive) VALUES
('CAT001', 'قطع غيار كهربائية', 'Electrical Parts', NULL, TRUE),
('CAT002', 'كابلات', 'Cables', 1, TRUE),
('CAT003', 'محولات', 'Transformers', 1, TRUE),
('CAT004', 'أدوات كهربائية', 'Electrical Tools', NULL, TRUE),
('CAT005', 'مواد استهلاكية', 'Consumables', NULL, TRUE);

-- الأصناف/المنتجات
INSERT INTO items (code, nameAr, nameEn, categoryId, barcode, unit, purchasePrice, salePrice, minStock, isActive, description, createdBy) VALUES
('ITEM001', 'كابل 4 ملم', '4mm Cable', 2, '1234567890123', 'متر', 50.00, 75.00, 100, TRUE, 'كابل كهربائي 4 ملم', 1),
('ITEM002', 'كابل 6 ملم', '6mm Cable', 2, '1234567890124', 'متر', 80.00, 120.00, 100, TRUE, 'كابل كهربائي 6 ملم', 1),
('ITEM003', 'محول 100 كيلو', '100KVA Transformer', 3, '1234567890125', 'قطعة', 500000.00, 750000.00, 5, TRUE, 'محول كهربائي 100 كيلو فولت أمبير', 1),
('ITEM004', 'محول 50 كيلو', '50KVA Transformer', 3, '1234567890126', 'قطعة', 300000.00, 450000.00, 5, TRUE, 'محول كهربائي 50 كيلو فولت أمبير', 1),
('ITEM005', 'كماشة كهربائي', 'Electrical Pliers', 4, '1234567890127', 'قطعة', 5000.00, 8000.00, 20, TRUE, 'كماشة للأعمال الكهربائية', 1),
('ITEM006', 'شريط عازل', 'Insulation Tape', 5, '1234567890128', 'قطعة', 500.00, 1000.00, 50, TRUE, 'شريط عازل كهربائي', 1);

-- حركات المخزون (إدخال أولي)
INSERT INTO stockMovements (movementNumber, type, date, warehouseId, itemId, quantity, unitPrice, totalAmount, notes, createdBy) VALUES
('SM001', 'in', NOW(), 1, 1, 1000.00, 50.00, 50000.00, 'إدخال أولي - كابل 4 ملم', 1),
('SM002', 'in', NOW(), 1, 2, 500.00, 80.00, 40000.00, 'إدخال أولي - كابل 6 ملم', 1),
('SM003', 'in', NOW(), 1, 3, 10.00, 500000.00, 5000000.00, 'إدخال أولي - محول 100 كيلو', 1),
('SM004', 'in', NOW(), 1, 4, 15.00, 300000.00, 4500000.00, 'إدخال أولي - محول 50 كيلو', 1),
('SM005', 'in', NOW(), 1, 5, 50.00, 5000.00, 250000.00, 'إدخال أولي - كماشة', 1),
('SM006', 'in', NOW(), 1, 6, 200.00, 500.00, 100000.00, 'إدخال أولي - شريط عازل', 1);

-- تحديث جدول inventory
INSERT INTO inventory (warehouseId, itemId, quantity) VALUES
(1, 1, 1000.00),
(1, 2, 500.00),
(1, 3, 10.00),
(1, 4, 15.00),
(1, 5, 50.00),
(1, 6, 200.00);

-- ============================================
-- بيانات وحدة المبيعات
-- ============================================

-- عروض الأسعار
INSERT INTO quotations (quotationNumber, date, customerId, branchId, totalAmount, taxAmount, discountAmount, netAmount, status, validUntil, notes, createdBy) VALUES
('QT2025001', NOW(), 1, 1, 100000.00, 0.00, 0.00, 100000.00, 'sent', DATE_ADD(NOW(), INTERVAL 30 DAY), 'عرض سعر لتوريد كابلات', 1),
('QT2025002', NOW(), 2, 1, 750000.00, 0.00, 0.00, 750000.00, 'accepted', DATE_ADD(NOW(), INTERVAL 30 DAY), 'عرض سعر لتوريد محول', 1);

-- بنود عروض الأسعار
INSERT INTO quotationItems (quotationId, itemId, quantity, unitPrice, totalAmount, notes) VALUES
(1, 1, 1000.00, 75.00, 75000.00, 'كابل 4 ملم'),
(1, 6, 250.00, 1000.00, 25000.00, 'شريط عازل'),
(2, 3, 1.00, 750000.00, 750000.00, 'محول 100 كيلو');

-- فواتير المبيعات
INSERT INTO salesInvoices (invoiceNumber, date, customerId, branchId, warehouseId, totalAmount, taxAmount, discountAmount, netAmount, paidAmount, remainingAmount, status, notes, createdBy) VALUES
('SI2025001', NOW(), 1, 1, 1, 75000.00, 0.00, 0.00, 75000.00, 50000.00, 25000.00, 'posted', 'فاتورة بيع كابلات', 1),
('SI2025002', NOW(), 2, 1, 1, 750000.00, 0.00, 50000.00, 700000.00, 0.00, 700000.00, 'draft', 'فاتورة بيع محول - مسودة', 1);

-- بنود فواتير المبيعات
INSERT INTO salesInvoiceItems (invoiceId, itemId, quantity, unitPrice, totalAmount, notes) VALUES
(1, 1, 1000.00, 75.00, 75000.00, 'كابل 4 ملم'),
(2, 3, 1.00, 750000.00, 750000.00, 'محول 100 كيلو');

-- حركات مخزون (خروج بسبب المبيعات)
INSERT INTO stockMovements (movementNumber, type, date, warehouseId, itemId, quantity, unitPrice, totalAmount, referenceType, referenceId, notes, createdBy) VALUES
('SM007', 'out', NOW(), 1, 1, 1000.00, 75.00, 75000.00, 'sales_invoice', 1, 'خروج بسبب فاتورة مبيعات SI2025001', 1);

-- تحديث inventory
UPDATE inventory SET quantity = quantity - 1000.00 WHERE warehouseId = 1 AND itemId = 1;

-- ============================================
-- بيانات وحدة المشتريات
-- ============================================

-- طلبات الشراء
INSERT INTO purchaseOrders (orderNumber, date, supplierId, branchId, totalAmount, taxAmount, discountAmount, netAmount, status, notes, createdBy) VALUES
('PO2025001', NOW(), 3, 1, 500000.00, 0.00, 0.00, 500000.00, 'sent', 'طلب شراء كابلات', 1),
('PO2025002', NOW(), 4, 1, 300000.00, 0.00, 0.00, 300000.00, 'draft', 'طلب شراء محولات - مسودة', 1);

-- بنود طلبات الشراء
INSERT INTO purchaseOrderItems (orderId, itemId, quantity, unitPrice, totalAmount, notes) VALUES
(1, 1, 10000.00, 50.00, 500000.00, 'كابل 4 ملم'),
(2, 4, 1.00, 300000.00, 300000.00, 'محول 50 كيلو');

-- فواتير المشتريات
INSERT INTO purchaseInvoices (invoiceNumber, date, supplierId, branchId, warehouseId, totalAmount, taxAmount, discountAmount, netAmount, paidAmount, remainingAmount, status, notes, createdBy) VALUES
('PI2025001', NOW(), 3, 1, 1, 500000.00, 0.00, 0.00, 500000.00, 300000.00, 200000.00, 'posted', 'فاتورة شراء كابلات', 1);

-- بنود فواتير المشتريات
INSERT INTO purchaseInvoiceItems (invoiceId, itemId, quantity, unitPrice, totalAmount, notes) VALUES
(1, 1, 10000.00, 50.00, 500000.00, 'كابل 4 ملم');

-- حركات مخزون (دخول بسبب المشتريات)
INSERT INTO stockMovements (movementNumber, type, date, warehouseId, itemId, quantity, unitPrice, totalAmount, referenceType, referenceId, notes, createdBy) VALUES
('SM008', 'in', NOW(), 1, 1, 10000.00, 50.00, 500000.00, 'purchase_invoice', 1, 'دخول بسبب فاتورة مشتريات PI2025001', 1);

-- تحديث inventory
UPDATE inventory SET quantity = quantity + 10000.00 WHERE warehouseId = 1 AND itemId = 1;

-- ============================================
-- بيانات وحدة إدارة الطاقة
-- ============================================

-- المحطات
INSERT INTO stations (code, nameAr, nameEn, branchId, capacity, location, isActive, createdBy) VALUES
('ST001', 'محطة صنعاء الرئيسية', 'Sanaa Main Station', 1, 5000.00, 'صنعاء - حي السبعين', TRUE, 1),
('ST002', 'محطة عدن', 'Aden Station', 1, 3000.00, 'عدن - كريتر', TRUE, 1),
('ST003', 'محطة تعز', 'Taiz Station', 1, 2000.00, 'تعز - الجند', TRUE, 1);

-- الاشتراكات
INSERT INTO subscriptions (subscriptionNumber, customerId, stationId, meterNumber, startDate, endDate, status, createdBy) VALUES
('SUB2025001', 1, 1, 'MTR001234', NOW(), NULL, 'active', 1),
('SUB2025002', 2, 1, 'MTR001235', NOW(), NULL, 'active', 1),
('SUB2025003', 1, 2, 'MTR002001', NOW(), NULL, 'active', 1);

-- قراءات العدادات
INSERT INTO meterReadings (subscriptionId, readingDate, previousReading, currentReading, consumption, notes, createdBy) VALUES
(1, DATE_SUB(NOW(), INTERVAL 30 DAY), 1000.00, 1500.00, 500.00, 'قراءة شهر 1', 1),
(1, NOW(), 1500.00, 2100.00, 600.00, 'قراءة شهر 2', 1),
(2, DATE_SUB(NOW(), INTERVAL 30 DAY), 500.00, 800.00, 300.00, 'قراءة شهر 1', 1),
(2, NOW(), 800.00, 1200.00, 400.00, 'قراءة شهر 2', 1),
(3, DATE_SUB(NOW(), INTERVAL 30 DAY), 2000.00, 2700.00, 700.00, 'قراءة شهر 1', 1),
(3, NOW(), 2700.00, 3500.00, 800.00, 'قراءة شهر 2', 1);

-- ============================================
-- بيانات إضافية (الأصول، الموظفين)
-- ============================================

-- الأصول (مع currencyId)
INSERT INTO assets (code, nameAr, nameEn, purchaseDate, purchasePrice, currentValue, currencyId, depreciationRate, branchId, isActive, createdBy) VALUES
('AST001', 'مولد كهربائي 500 كيلو', '500KVA Generator', DATE_SUB(NOW(), INTERVAL 2 YEAR), 10000000, 8000000, 1, 10, 1, TRUE, 1),
('AST002', 'شاحنة نقل', 'Transport Truck', DATE_SUB(NOW(), INTERVAL 1 YEAR), 5000000, 4500000, 1, 10, 1, TRUE, 1),
('AST003', 'معدات ورشة', 'Workshop Equipment', DATE_SUB(NOW(), INTERVAL 3 YEAR), 2000000, 1400000, 1, 10, 1, TRUE, 1);

-- الموظفين
INSERT INTO employees (code, fullName, position, branchId, salary, hireDate, isActive, createdBy) VALUES
('EMP001', 'أحمد محمد علي', 'مدير المشاريع', 1, 300000.00, DATE_SUB(NOW(), INTERVAL 5 YEAR), TRUE, 1),
('EMP002', 'فاطمة حسن', 'محاسبة', 1, 200000.00, DATE_SUB(NOW(), INTERVAL 3 YEAR), TRUE, 1),
('EMP003', 'خالد سعيد', 'فني كهرباء', 1, 150000.00, DATE_SUB(NOW(), INTERVAL 2 YEAR), TRUE, 1),
('EMP004', 'مريم عبدالله', 'موظفة خدمة عملاء', 1, 120000.00, DATE_SUB(NOW(), INTERVAL 1 YEAR), TRUE, 1);

SELECT '✅ تم تحميل البيانات التجريبية الشاملة بنجاح!' as status;
