-- ============================================
-- البيانات التجريبية لوحدة المحاسبة
-- نظام العباسي الموحد
-- ============================================

-- 1. العملات
INSERT INTO currencies (code, name_ar, name_en, symbol, exchange_rate, is_active) VALUES
('YER', 'ريال يمني', 'Yemeni Rial', 'ر.ي', 1.00, true),
('USD', 'دولار أمريكي', 'US Dollar', '$', 1350.00, true),
('SAR', 'ريال سعودي', 'Saudi Riyal', 'ر.س', 360.00, true),
('EUR', 'يورو', 'Euro', '€', 1450.00, true);

-- 2. المؤسسة
INSERT INTO organizations (name_ar, name_en, tax_number, phone, email, address, is_active) VALUES
('شركة العباسي التجارية', 'Alabasi Trading Company', 'TAX-12345', '+967-1-234567', 'info@alabasi.com', 'صنعاء، اليمن', true);

-- 3. الفرع
INSERT INTO branches (organization_id, name_ar, name_en, phone, email, address, is_active) VALUES
(1, 'الفرع الرئيسي', 'Main Branch', '+967-1-234567', 'main@alabasi.com', 'شارع الزبيري، صنعاء', true);

-- 4. الوحدة المحاسبية
INSERT INTO units (organization_id, branch_id, name_ar, name_en, start_date, fiscal_year_start, is_active) VALUES
(1, 1, 'الوحدة المحاسبية الرئيسية', 'Main Accounting Unit', '2025-01-01', '2025-01-01', true);

-- 5. أنواع الحسابات الرئيسية
INSERT INTO account_types (code, name_ar, name_en, category, display_order) VALUES
('1', 'الأصول', 'Assets', 'asset', 1),
('2', 'الخصوم', 'Liabilities', 'liability', 2),
('3', 'حقوق الملكية', 'Equity', 'equity', 3),
('4', 'الإيرادات', 'Revenue', 'revenue', 4),
('5', 'المصروفات', 'Expenses', 'expense', 5);

-- 6. الحسابات الرئيسية
-- الأصول
INSERT INTO chart_of_accounts (unit_id, account_type_id, code, name_ar, name_en, is_parent, level) VALUES
(1, 1, '1', 'الأصول', 'Assets', true, 1),
(1, 1, '11', 'الأصول المتداولة', 'Current Assets', true, 2),
(1, 1, '111', 'النقدية والبنوك', 'Cash and Banks', true, 3);

-- الخصوم
INSERT INTO chart_of_accounts (unit_id, account_type_id, code, name_ar, name_en, is_parent, level) VALUES
(1, 2, '2', 'الخصوم', 'Liabilities', true, 1),
(1, 2, '21', 'الخصوم المتداولة', 'Current Liabilities', true, 2),
(1, 2, '211', 'الموردون', 'Suppliers', true, 3);

-- حقوق الملكية
INSERT INTO chart_of_accounts (unit_id, account_type_id, code, name_ar, name_en, is_parent, level) VALUES
(1, 3, '3', 'حقوق الملكية', 'Equity', true, 1),
(1, 3, '31', 'رأس المال', 'Capital', true, 2);

-- الإيرادات
INSERT INTO chart_of_accounts (unit_id, account_type_id, code, name_ar, name_en, is_parent, level) VALUES
(1, 4, '4', 'الإيرادات', 'Revenue', true, 1),
(1, 4, '41', 'إيرادات المبيعات', 'Sales Revenue', true, 2);

-- المصروفات
INSERT INTO chart_of_accounts (unit_id, account_type_id, code, name_ar, name_en, is_parent, level) VALUES
(1, 5, '5', 'المصروفات', 'Expenses', true, 1),
(1, 5, '51', 'مصروفات التشغيل', 'Operating Expenses', true, 2);

-- 7. الحسابات الفرعية
-- حسابات النقدية
INSERT INTO chart_of_accounts (unit_id, account_type_id, parent_id, code, name_ar, name_en, is_parent, level, analytical_type) VALUES
(1, 1, 3, '1111', 'الصناديق', 'Cash Boxes', false, 4, 'fund'),
(1, 1, 3, '1112', 'البنوك', 'Banks', false, 4, 'bank'),
(1, 1, 3, '1113', 'الصرافين', 'Cashiers', false, 4, 'cashier');

-- حسابات العملاء
INSERT INTO chart_of_accounts (unit_id, account_type_id, parent_id, code, name_ar, name_en, is_parent, level, analytical_type) VALUES
(1, 1, 2, '1121', 'العملاء', 'Customers', false, 4, 'customer');

-- حسابات الموردين
INSERT INTO chart_of_accounts (unit_id, account_type_id, parent_id, code, name_ar, name_en, is_parent, level, analytical_type) VALUES
(1, 2, 6, '2111', 'الموردون', 'Suppliers', false, 4, 'supplier');

-- حسابات المصروفات
INSERT INTO chart_of_accounts (unit_id, account_type_id, parent_id, code, name_ar, name_en, is_parent, level) VALUES
(1, 5, 11, '5101', 'الرواتب والأجور', 'Salaries and Wages', false, 3),
(1, 5, 11, '5102', 'الإيجارات', 'Rent', false, 3),
(1, 5, 11, '5103', 'الكهرباء والماء', 'Utilities', false, 3);

-- حسابات الإيرادات
INSERT INTO chart_of_accounts (unit_id, account_type_id, parent_id, code, name_ar, name_en, is_parent, level) VALUES
(1, 4, 9, '4101', 'مبيعات البضائع', 'Goods Sales', false, 3),
(1, 4, 9, '4102', 'إيرادات الخدمات', 'Service Revenue', false, 3);

-- 8. ربط العملات بالحسابات
-- الصناديق (YER فقط)
INSERT INTO account_currencies (account_id, currency_id) VALUES (13, 1);

-- البنوك (جميع العملات)
INSERT INTO account_currencies (account_id, currency_id) VALUES 
(14, 1), (14, 2), (14, 3), (14, 4);

-- الصرافين (YER و USD)
INSERT INTO account_currencies (account_id, currency_id) VALUES 
(15, 1), (15, 2);

-- العملاء (جميع العملات)
INSERT INTO account_currencies (account_id, currency_id) VALUES 
(16, 1), (16, 2), (16, 3), (16, 4);

-- الموردين (جميع العملات)
INSERT INTO account_currencies (account_id, currency_id) VALUES 
(17, 1), (17, 2), (17, 3), (17, 4);

-- 9. الحسابات التحليلية
-- الصناديق
INSERT INTO funds (unit_id, branch_id, account_id, code, name_ar, name_en, opening_balance, current_balance, status) VALUES
(1, 1, 13, 'CASH-001', 'الصندوق الرئيسي', 'Main Cash Box', 100000.00, 100000.00, 'active'),
(1, 1, 13, 'CASH-002', 'صندوق المبيعات', 'Sales Cash Box', 50000.00, 50000.00, 'active');

INSERT INTO fund_currencies (fund_id, currency_id) VALUES (1, 1), (2, 1);

-- البنوك
INSERT INTO banks (unit_id, branch_id, account_id, code, name_ar, name_en, bank_name, account_number, iban, swift_code, opening_balance, current_balance, status) VALUES
(1, 1, 14, 'BANK-001', 'حساب البنك الأهلي', 'National Bank Account', 'البنك الأهلي اليمني', '123456789', 'YE12345678901234567890', 'NBOYYE22', 500000.00, 500000.00, 'active'),
(1, 1, 14, 'BANK-002', 'حساب بنك التسليف', 'Taslif Bank Account', 'بنك التسليف والادخار', '987654321', 'YE98765432109876543210', 'TBSYYE22', 300000.00, 300000.00, 'active');

INSERT INTO bank_currencies (bank_id, currency_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4);

-- الصرافين
INSERT INTO cashiers (unit_id, branch_id, account_id, code, name_ar, name_en, employee_name, phone, opening_balance, current_balance, status) VALUES
(1, 1, 15, 'CASH-001', 'الصراف أحمد', 'Cashier Ahmed', 'أحمد محمد', '+967-777-123456', 20000.00, 20000.00, 'active'),
(1, 1, 15, 'CASH-002', 'الصراف علي', 'Cashier Ali', 'علي حسن', '+967-777-654321', 15000.00, 15000.00, 'active');

INSERT INTO cashier_currencies (cashier_id, currency_id) VALUES 
(1, 1), (1, 2),
(2, 1), (2, 2);

-- العملاء
INSERT INTO customers (unit_id, branch_id, account_id, code, name_ar, name_en, tax_number, phone, email, address, credit_limit, opening_balance, current_balance, status) VALUES
(1, 1, 16, 'CUST-001', 'شركة النور التجارية', 'Al-Noor Trading Co.', 'TAX-C001', '+967-1-111111', 'noor@example.com', 'صنعاء', 1000000.00, 0.00, 0.00, 'active'),
(1, 1, 16, 'CUST-002', 'مؤسسة الأمل', 'Al-Amal Foundation', 'TAX-C002', '+967-1-222222', 'amal@example.com', 'عدن', 500000.00, 0.00, 0.00, 'active');

INSERT INTO customer_currencies (customer_id, currency_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4);

-- الموردين
INSERT INTO suppliers (unit_id, branch_id, account_id, code, name_ar, name_en, tax_number, phone, email, address, credit_limit, opening_balance, current_balance, status) VALUES
(1, 1, 17, 'SUPP-001', 'شركة الإمداد', 'Supply Company', 'TAX-S001', '+967-1-333333', 'supply@example.com', 'صنعاء', 2000000.00, 0.00, 0.00, 'active'),
(1, 1, 17, 'SUPP-002', 'مؤسسة التوريد', 'Provision Foundation', 'TAX-S002', '+967-1-444444', 'provision@example.com', 'تعز', 1500000.00, 0.00, 0.00, 'active');

INSERT INTO supplier_currencies (supplier_id, currency_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4);

-- تم إنشاء البيانات التجريبية بنجاح!
