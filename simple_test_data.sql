-- ============================================
-- بيانات تجريبية بسيطة - نظام العباسي الموحد
-- متوافقة مع schema الفعلي
-- ============================================

-- 1. العملات
INSERT INTO currencies (code, nameAr, nameEn, symbol, isActive) VALUES
('YER', 'ريال يمني', 'Yemeni Rial', 'ر.ي', 1),
('USD', 'دولار أمريكي', 'US Dollar', '$', 1),
('SAR', 'ريال سعودي', 'Saudi Riyal', 'ر.س', 1);

-- 2. الوحدة المحاسبية
INSERT INTO units (name, code, description, isActive) VALUES
('الوحدة المحاسبية الرئيسية', 'UNIT-001', 'الوحدة المحاسبية الرئيسية للنظام', 1);

-- 3. المؤسسة
INSERT INTO organizations (unitId, name, code, taxNumber, address, phone, email, isActive) VALUES
(1, 'شركة العباسي التجارية', 'ORG-001', 'TAX-12345', 'صنعاء، اليمن', '+967-1-234567', 'info@alabasi.com', 1);

-- 4. الفرع
INSERT INTO branches (organizationId, name, code, address, phone, email, isActive) VALUES
(1, 'الفرع الرئيسي', 'BRANCH-001', 'شارع الزبيري، صنعاء', '+967-1-234567', 'main@alabasi.com', 1);

-- 5. فئات الحسابات
INSERT INTO accountCategories (code, nameAr, nameEn, type, displayOrder) VALUES
('1', 'الأصول', 'Assets', 'asset', 1),
('2', 'الخصوم', 'Liabilities', 'liability', 2),
('3', 'حقوق الملكية', 'Equity', 'equity', 3),
('4', 'الإيرادات', 'Revenue', 'revenue', 4),
('5', 'المصروفات', 'Expenses', 'expense', 5);

-- 6. دليل الحسابات - المستوى الأول
INSERT INTO chartOfAccounts (code, nameAr, nameEn, categoryId, level, isParent, isActive) VALUES
('1', 'الأصول', 'Assets', 1, 1, 1, 1),
('2', 'الخصوم', 'Liabilities', 2, 1, 1, 1),
('3', 'حقوق الملكية', 'Equity', 3, 1, 1, 1),
('4', 'الإيرادات', 'Revenue', 4, 1, 1, 1),
('5', 'المصروفات', 'Expenses', 5, 1, 1, 1);

-- 7. دليل الحسابات - المستوى الثاني
INSERT INTO chartOfAccounts (code, nameAr, nameEn, parentId, categoryId, level, isParent, isActive) VALUES
('11', 'الأصول المتداولة', 'Current Assets', 1, 1, 2, 1, 1),
('21', 'الخصوم المتداولة', 'Current Liabilities', 2, 2, 2, 1, 1),
('31', 'رأس المال', 'Capital', 3, 3, 2, 1, 1),
('41', 'إيرادات المبيعات', 'Sales Revenue', 4, 4, 2, 1, 1),
('51', 'مصروفات التشغيل', 'Operating Expenses', 5, 5, 2, 1, 1);

-- 8. دليل الحسابات - المستوى الثالث
INSERT INTO chartOfAccounts (code, nameAr, nameEn, parentId, categoryId, level, isParent, isActive) VALUES
('111', 'النقدية والبنوك', 'Cash and Banks', 6, 1, 3, 1, 1),
('211', 'الموردون', 'Suppliers', 7, 2, 3, 1, 1);

-- 9. دليل الحسابات - المستوى الرابع (الحسابات الفرعية)
INSERT INTO chartOfAccounts (code, nameAr, nameEn, parentId, categoryId, level, isParent, isActive, description) VALUES
('1111', 'الصناديق', 'Cash Boxes', 11, 1, 4, 0, 1, 'حسابات الصناديق النقدية'),
('1112', 'البنوك', 'Banks', 11, 1, 4, 0, 1, 'حسابات البنوك'),
('1121', 'العملاء', 'Customers', 6, 1, 4, 0, 1, 'حسابات العملاء'),
('2111', 'الموردون', 'Suppliers', 12, 2, 4, 0, 1, 'حسابات الموردين'),
('3101', 'رأس المال', 'Capital', 8, 3, 3, 0, 1, 'رأس المال'),
('4101', 'مبيعات البضائع', 'Goods Sales', 9, 4, 3, 0, 1, 'إيرادات مبيعات البضائع'),
('5101', 'الرواتب والأجور', 'Salaries', 10, 5, 3, 0, 1, 'رواتب وأجور الموظفين'),
('5102', 'الإيجارات', 'Rent', 10, 5, 3, 0, 1, 'إيجارات المكاتب والمحلات');

-- 10. ربط العملات بالحسابات
-- الصناديق (YER فقط)
INSERT INTO accountCurrencies (accountId, currencyId) VALUES (13, 1);

-- البنوك (جميع العملات)
INSERT INTO accountCurrencies (accountId, currencyId) VALUES 
(14, 1), (14, 2), (14, 3);

-- العملاء (جميع العملات)
INSERT INTO accountCurrencies (accountId, currencyId) VALUES 
(15, 1), (15, 2), (15, 3);

-- الموردين (جميع العملات)
INSERT INTO accountCurrencies (accountId, currencyId) VALUES 
(16, 1), (16, 2), (16, 3);

-- 11. أنواع الحسابات التحليلية
INSERT INTO analyticalAccountTypes (code, nameAr, nameEn, linkedAccountId) VALUES
('fund', 'صندوق', 'Fund', 13),
('bank', 'بنك', 'Bank', 14),
('customer', 'عميل', 'Customer', 15),
('supplier', 'مورد', 'Supplier', 16);

-- 12. الحسابات التحليلية - الصناديق
INSERT INTO analyticalAccounts (typeId, branchId, code, nameAr, nameEn, openingBalance, currentBalance, isActive) VALUES
(1, 1, 'CASH-001', 'الصندوق الرئيسي', 'Main Cash Box', 100000.00, 100000.00, 1),
(1, 1, 'CASH-002', 'صندوق المبيعات', 'Sales Cash Box', 50000.00, 50000.00, 1);

-- 13. الحسابات التحليلية - البنوك
INSERT INTO analyticalAccounts (typeId, branchId, code, nameAr, nameEn, openingBalance, currentBalance, isActive, metadata) VALUES
(2, 1, 'BANK-001', 'حساب البنك الأهلي', 'National Bank Account', 500000.00, 500000.00, 1, '{"bankName":"البنك الأهلي اليمني","accountNumber":"123456789","iban":"YE12345678901234567890"}'),
(2, 1, 'BANK-002', 'حساب بنك التسليف', 'Taslif Bank Account', 300000.00, 300000.00, 1, '{"bankName":"بنك التسليف والادخار","accountNumber":"987654321","iban":"YE98765432109876543210"}');

-- 14. الحسابات التحليلية - العملاء
INSERT INTO analyticalAccounts (typeId, branchId, code, nameAr, nameEn, openingBalance, currentBalance, isActive, metadata) VALUES
(3, 1, 'CUST-001', 'شركة النور التجارية', 'Al-Noor Trading Co.', 0.00, 0.00, 1, '{"taxNumber":"TAX-C001","phone":"+967-1-111111","email":"noor@example.com","address":"صنعاء"}'),
(3, 1, 'CUST-002', 'مؤسسة الأمل', 'Al-Amal Foundation', 0.00, 0.00, 1, '{"taxNumber":"TAX-C002","phone":"+967-1-222222","email":"amal@example.com","address":"عدن"}');

-- 15. الحسابات التحليلية - الموردين
INSERT INTO analyticalAccounts (typeId, branchId, code, nameAr, nameEn, openingBalance, currentBalance, isActive, metadata) VALUES
(4, 1, 'SUPP-001', 'شركة الإمداد', 'Supply Company', 0.00, 0.00, 1, '{"taxNumber":"TAX-S001","phone":"+967-1-333333","email":"supply@example.com","address":"صنعاء"}'),
(4, 1, 'SUPP-002', 'مؤسسة التوريد', 'Provision Foundation', 0.00, 0.00, 1, '{"taxNumber":"TAX-S002","phone":"+967-1-444444","email":"provision@example.com","address":"تعز"}');

-- تم إنشاء البيانات التجريبية بنجاح!
