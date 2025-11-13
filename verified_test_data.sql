-- ============================================
-- بيانات تجريبية متوافقة 100% - نظام العباسي الموحد
-- تم التحقق من توافقها مع schema الفعلي
-- ============================================

-- تنظيف البيانات القديمة (إن وجدت)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE journalEntryLines;
TRUNCATE TABLE journalEntries;
TRUNCATE TABLE vouchers;
TRUNCATE TABLE analyticalAccounts;
TRUNCATE TABLE analyticalAccountTypes;
TRUNCATE TABLE accountCurrencies;
TRUNCATE TABLE chartOfAccounts;
TRUNCATE TABLE accountCategories;
TRUNCATE TABLE branches;
TRUNCATE TABLE organizations;
TRUNCATE TABLE units;
TRUNCATE TABLE currencies;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. العملات (Currencies)
-- ============================================
INSERT INTO currencies (code, nameAr, nameEn, symbol, isActive) VALUES
('YER', 'ريال يمني', 'Yemeni Rial', 'ر.ي', 1),
('USD', 'دولار أمريكي', 'US Dollar', '$', 1),
('SAR', 'ريال سعودي', 'Saudi Riyal', 'ر.س', 1),
('EUR', 'يورو', 'Euro', '€', 1);

-- ============================================
-- 2. الوحدة المحاسبية (Unit)
-- ============================================
INSERT INTO units (name, code, description, isActive, createdBy) VALUES
('الوحدة المحاسبية الرئيسية', 'UNIT-001', 'الوحدة المحاسبية الرئيسية للنظام', 1, NULL);

-- ============================================
-- 3. المؤسسة (Organization)
-- ============================================
INSERT INTO organizations (unitId, name, code, taxNumber, address, phone, email, isActive, createdBy) VALUES
(1, 'شركة العباسي التجارية', 'ORG-001', 'TAX-12345', 'صنعاء، اليمن', '+967-1-234567', 'info@alabasi.com', 1, NULL);

-- ============================================
-- 4. الفرع (Branch)
-- ============================================
INSERT INTO branches (code, nameAr, nameEn, isMain, isActive, createdBy) VALUES
('BRANCH-001', 'الفرع الرئيسي', 'Main Branch', 1, 1, NULL),
('BRANCH-002', 'فرع الحديدة', 'Hodeidah Branch', 0, 1, NULL);

-- ============================================
-- 5. فئات الحسابات (Account Categories)
-- ============================================
INSERT INTO accountCategories (code, nameAr, nameEn, type) VALUES
('1', 'الأصول', 'Assets', 'asset'),
('2', 'الخصوم', 'Liabilities', 'liability'),
('3', 'حقوق الملكية', 'Equity', 'equity'),
('4', 'الإيرادات', 'Revenue', 'revenue'),
('5', 'المصروفات', 'Expenses', 'expense');

-- ============================================
-- 6. دليل الحسابات - المستوى الأول (Parent Accounts)
-- ============================================
INSERT INTO chartOfAccounts (code, nameAr, nameEn, parentId, categoryId, level, isParent, isActive, createdBy) VALUES
('1', 'الأصول', 'Assets', NULL, 1, 1, 1, 1, NULL),
('2', 'الخصوم', 'Liabilities', NULL, 2, 1, 1, 1, NULL),
('3', 'حقوق الملكية', 'Equity', NULL, 3, 1, 1, 1, NULL),
('4', 'الإيرادات', 'Revenue', NULL, 4, 1, 1, 1, NULL),
('5', 'المصروفات', 'Expenses', NULL, 5, 1, 1, 1, NULL);

-- ============================================
-- 7. دليل الحسابات - المستوى الثاني
-- ============================================
INSERT INTO chartOfAccounts (code, nameAr, nameEn, parentId, categoryId, level, isParent, isActive, createdBy) VALUES
('11', 'الأصول المتداولة', 'Current Assets', 1, 1, 2, 1, 1, NULL),
('12', 'الأصول الثابتة', 'Fixed Assets', 1, 1, 2, 1, 1, NULL),
('21', 'الخصوم المتداولة', 'Current Liabilities', 2, 2, 2, 1, 1, NULL),
('31', 'رأس المال', 'Capital', 3, 3, 2, 1, 1, NULL),
('41', 'إيرادات المبيعات', 'Sales Revenue', 4, 4, 2, 1, 1, NULL),
('51', 'مصروفات التشغيل', 'Operating Expenses', 5, 5, 2, 1, 1, NULL);

-- ============================================
-- 8. دليل الحسابات - المستوى الثالث
-- ============================================
INSERT INTO chartOfAccounts (code, nameAr, nameEn, parentId, categoryId, level, isParent, isActive, createdBy) VALUES
('111', 'النقدية والبنوك', 'Cash and Banks', 6, 1, 3, 1, 1, NULL),
('112', 'الذمم المدينة', 'Accounts Receivable', 6, 1, 3, 1, 1, NULL),
('211', 'الذمم الدائنة', 'Accounts Payable', 8, 2, 3, 1, 1, NULL);

-- ============================================
-- 9. دليل الحسابات - المستوى الرابع (الحسابات الفرعية)
-- ============================================
INSERT INTO chartOfAccounts (code, nameAr, nameEn, parentId, categoryId, level, isParent, isActive, description, createdBy) VALUES
-- النقدية والبنوك
('1111', 'الصناديق', 'Cash Boxes', 12, 1, 4, 0, 1, 'حسابات الصناديق النقدية', NULL),
('1112', 'البنوك', 'Banks', 12, 1, 4, 0, 1, 'حسابات البنوك', NULL),
-- الذمم المدينة
('1121', 'العملاء', 'Customers', 13, 1, 4, 0, 1, 'حسابات العملاء', NULL),
-- الذمم الدائنة
('2111', 'الموردون', 'Suppliers', 14, 2, 4, 0, 1, 'حسابات الموردين', NULL),
-- رأس المال
('3101', 'رأس المال', 'Capital', 9, 3, 3, 0, 1, 'رأس المال', NULL),
-- الإيرادات
('4101', 'مبيعات البضائع', 'Goods Sales', 10, 4, 3, 0, 1, 'إيرادات مبيعات البضائع', NULL),
-- المصروفات
('5101', 'الرواتب والأجور', 'Salaries', 11, 5, 3, 0, 1, 'رواتب وأجور الموظفين', NULL),
('5102', 'الإيجارات', 'Rent', 11, 5, 3, 0, 1, 'إيجارات المكاتب والمحلات', NULL);

-- ============================================
-- 10. ربط العملات بالحسابات (Account Currencies)
-- ============================================
-- الصناديق (YER فقط)
INSERT INTO accountCurrencies (accountId, currencyId) VALUES (15, 1);

-- البنوك (جميع العملات)
INSERT INTO accountCurrencies (accountId, currencyId) VALUES 
(16, 1), (16, 2), (16, 3), (16, 4);

-- العملاء (جميع العملات)
INSERT INTO accountCurrencies (accountId, currencyId) VALUES 
(17, 1), (17, 2), (17, 3);

-- الموردين (جميع العملات)
INSERT INTO accountCurrencies (accountId, currencyId) VALUES 
(18, 1), (18, 2), (18, 3);

-- ============================================
-- 11. أنواع الحسابات التحليلية (Analytical Account Types)
-- ============================================
INSERT INTO analyticalAccountTypes (code, nameAr, nameEn, icon) VALUES
('fund', 'صندوق', 'Fund', '💰'),
('bank', 'بنك', 'Bank', '🏦'),
('customer', 'عميل', 'Customer', '👤'),
('supplier', 'مورد', 'Supplier', '🏭');

-- ============================================
-- 12. الحسابات التحليلية - الصناديق
-- ============================================
INSERT INTO analyticalAccounts (code, nameAr, nameEn, chartAccountId, typeId, branchId, openingBalance, currentBalance, currencyId, isActive, createdBy) VALUES
('CASH-001', 'الصندوق الرئيسي', 'Main Cash Box', 15, 1, 1, 100000, 100000, 1, 1, NULL),
('CASH-002', 'صندوق المبيعات', 'Sales Cash Box', 15, 1, 1, 50000, 50000, 1, 1, NULL),
('CASH-003', 'صندوق فرع الحديدة', 'Hodeidah Cash Box', 15, 1, 2, 30000, 30000, 1, 1, NULL);

-- ============================================
-- 13. الحسابات التحليلية - البنوك
-- ============================================
INSERT INTO analyticalAccounts (code, nameAr, nameEn, chartAccountId, typeId, branchId, openingBalance, currentBalance, currencyId, isActive, description, createdBy) VALUES
('BANK-001', 'حساب البنك الأهلي', 'National Bank Account', 16, 2, 1, 500000, 500000, 1, 1, '{"bankName":"البنك الأهلي اليمني","accountNumber":"123456789","iban":"YE12345678901234567890"}', NULL),
('BANK-002', 'حساب بنك التسليف', 'Taslif Bank Account', 16, 2, 1, 300000, 300000, 1, 1, '{"bankName":"بنك التسليف والادخار","accountNumber":"987654321","iban":"YE98765432109876543210"}', NULL),
('BANK-003', 'حساب دولاري', 'USD Bank Account', 16, 2, 1, 10000, 10000, 2, 1, '{"bankName":"البنك الأهلي اليمني","accountNumber":"USD123456","currency":"USD"}', NULL);

-- ============================================
-- 14. الحسابات التحليلية - العملاء
-- ============================================
INSERT INTO analyticalAccounts (code, nameAr, nameEn, chartAccountId, typeId, branchId, openingBalance, currentBalance, currencyId, isActive, description, createdBy) VALUES
('CUST-001', 'شركة النور التجارية', 'Al-Noor Trading Co.', 17, 3, 1, 0, 0, 1, 1, '{"taxNumber":"TAX-C001","phone":"+967-1-111111","email":"noor@example.com","address":"صنعاء"}', NULL),
('CUST-002', 'مؤسسة الأمل', 'Al-Amal Foundation', 17, 3, 1, 0, 0, 1, 1, '{"taxNumber":"TAX-C002","phone":"+967-1-222222","email":"amal@example.com","address":"عدن"}', NULL);

-- ============================================
-- 15. الحسابات التحليلية - الموردين
-- ============================================
INSERT INTO analyticalAccounts (code, nameAr, nameEn, chartAccountId, typeId, branchId, openingBalance, currentBalance, currencyId, isActive, description, createdBy) VALUES
('SUPP-001', 'شركة الإمداد', 'Supply Company', 18, 4, 1, 0, 0, 1, 1, '{"taxNumber":"TAX-S001","phone":"+967-1-333333","email":"supply@example.com","address":"صنعاء"}', NULL),
('SUPP-002', 'مؤسسة التوريد', 'Provision Foundation', 18, 4, 1, 0, 0, 1, 1, '{"taxNumber":"TAX-S002","phone":"+967-1-444444","email":"provision@example.com","address":"تعز"}', NULL);

-- ============================================
-- تم إنشاء البيانات التجريبية بنجاح!
-- ============================================
SELECT '✅ تم تحميل البيانات التجريبية بنجاح!' as status;
SELECT COUNT(*) as total_currencies FROM currencies;
SELECT COUNT(*) as total_accounts FROM chartOfAccounts;
SELECT COUNT(*) as total_analytical FROM analyticalAccounts;
