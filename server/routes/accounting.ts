import { Router } from 'express';
import { db } from '../db';
import { 
  chartOfAccounts, 
  analyticalAccounts, 
  journalEntries, 
  journalEntryLines,
  currencies 
} from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

// ==================== دليل الحسابات ====================

// الحصول على جميع الحسابات
router.get('/chart-of-accounts', async (req, res) => {
  try {
    const accounts = await db
      .select()
      .from(chartOfAccounts)
      .orderBy(chartOfAccounts.code);
    
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// الحصول على حساب واحد
router.get('/chart-of-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const account = await db
      .select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.id, parseInt(id)))
      .limit(1);
    
    if (account.length === 0) {
      return res.status(404).json({ success: false, error: 'الحساب غير موجود' });
    }
    
    res.json({ success: true, data: account[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// إضافة حساب جديد
router.post('/chart-of-accounts', async (req, res) => {
  try {
    const { code, nameAr, nameEn, accountTypeId, parentAccountId, currencyId, level, isActive } = req.body;
    
    // التحقق من عدم تكرار الكود
    const existing = await db
      .select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.code, code))
      .limit(1);
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'كود الحساب موجود مسبقاً' });
    }
    
    const [newAccount] = await db
      .insert(chartOfAccounts)
      .values({
        code,
        nameAr,
        nameEn,
        accountTypeId,
        parentAccountId: parentAccountId || null,
        currencyId: currencyId || null,
        level: level || 1,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    
    res.status(201).json({ success: true, data: newAccount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// تحديث حساب
router.put('/chart-of-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, nameAr, nameEn, accountTypeId, parentAccountId, currencyId, level, isActive } = req.body;
    
    const [updatedAccount] = await db
      .update(chartOfAccounts)
      .set({
        code,
        nameAr,
        nameEn,
        accountTypeId,
        parentAccountId: parentAccountId || null,
        currencyId: currencyId || null,
        level,
        isActive,
        updatedAt: new Date()
      })
      .where(eq(chartOfAccounts.id, parseInt(id)));
    
    res.json({ success: true, data: updatedAccount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// حذف حساب
router.delete('/chart-of-accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // التحقق من عدم وجود حسابات فرعية
    const children = await db
      .select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.parentAccountId, parseInt(id)));
    
    if (children.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'لا يمكن حذف الحساب لوجود حسابات فرعية' 
      });
    }
    
    // التحقق من عدم وجود قيود على الحساب
    const entries = await db
      .select()
      .from(journalEntryLines)
      .where(eq(journalEntryLines.accountId, parseInt(id)))
      .limit(1);
    
    if (entries.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'لا يمكن حذف الحساب لوجود قيود محاسبية عليه' 
      });
    }
    
    await db
      .delete(chartOfAccounts)
      .where(eq(chartOfAccounts.id, parseInt(id)));
    
    res.json({ success: true, message: 'تم حذف الحساب بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== الحسابات التحليلية ====================

// الحصول على جميع الحسابات التحليلية
router.get('/analytical-accounts', async (req, res) => {
  try {
    const accounts = await db
      .select({
        id: analyticalAccounts.id,
        code: analyticalAccounts.code,
        nameAr: analyticalAccounts.nameAr,
        nameEn: analyticalAccounts.nameEn,
        accountType: analyticalAccounts.accountType,
        accountId: analyticalAccounts.accountId,
        accountCode: chartOfAccounts.code,
        accountNameAr: chartOfAccounts.nameAr,
        balance: analyticalAccounts.balance,
        isActive: analyticalAccounts.isActive
      })
      .from(analyticalAccounts)
      .leftJoin(chartOfAccounts, eq(analyticalAccounts.accountId, chartOfAccounts.id))
      .orderBy(analyticalAccounts.code);
    
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// إضافة حساب تحليلي جديد
router.post('/analytical-accounts', async (req, res) => {
  try {
    const { code, nameAr, nameEn, accountType, accountId, balance, isActive } = req.body;
    
    const [newAccount] = await db
      .insert(analyticalAccounts)
      .values({
        code,
        nameAr,
        nameEn,
        accountType,
        accountId,
        balance: balance || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    
    res.status(201).json({ success: true, data: newAccount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== القيود اليومية ====================

// الحصول على جميع القيود
router.get('/journal-entries', async (req, res) => {
  try {
    const entries = await db
      .select()
      .from(journalEntries)
      .orderBy(desc(journalEntries.entryDate));
    
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// الحصول على قيد واحد مع التفاصيل
router.get('/journal-entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, parseInt(id)))
      .limit(1);
    
    if (entry.length === 0) {
      return res.status(404).json({ success: false, error: 'القيد غير موجود' });
    }
    
    const lines = await db
      .select({
        id: journalEntryLines.id,
        accountId: journalEntryLines.accountId,
        accountCode: chartOfAccounts.code,
        accountNameAr: chartOfAccounts.nameAr,
        debit: journalEntryLines.debit,
        credit: journalEntryLines.credit,
        description: journalEntryLines.description,
        analyticalAccountId: journalEntryLines.analyticalAccountId
      })
      .from(journalEntryLines)
      .leftJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
      .where(eq(journalEntryLines.journalEntryId, parseInt(id)));
    
    res.json({ 
      success: true, 
      data: {
        ...entry[0],
        lines
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// إضافة قيد يومي جديد
router.post('/journal-entries', async (req, res) => {
  try {
    const { entryDate, entryNumber, description, reference, lines } = req.body;
    
    // التحقق من التوازن
    const totalDebit = lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        error: 'القيد غير متوازن: المدين لا يساوي الدائن' 
      });
    }
    
    // إنشاء القيد
    const [newEntry] = await db
      .insert(journalEntries)
      .values({
        entryDate: new Date(entryDate),
        entryNumber,
        description,
        reference,
        totalDebit,
        totalCredit,
        isPosted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    
    // إضافة السطور
    for (const line of lines) {
      await db
        .insert(journalEntryLines)
        .values({
          journalEntryId: newEntry.id,
          accountId: line.accountId,
          debit: line.debit || 0,
          credit: line.credit || 0,
          description: line.description,
          analyticalAccountId: line.analyticalAccountId || null,
          createdAt: new Date()
        });
    }
    
    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ترحيل قيد
router.post('/journal-entries/:id/post', async (req, res) => {
  try {
    const { id } = req.params;
    
    // تحديث حالة القيد
    await db
      .update(journalEntries)
      .set({ 
        isPosted: true,
        postedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(journalEntries.id, parseInt(id)));
    
    // تحديث أرصدة الحسابات التحليلية
    const lines = await db
      .select()
      .from(journalEntryLines)
      .where(eq(journalEntryLines.journalEntryId, parseInt(id)));
    
    for (const line of lines) {
      if (line.analyticalAccountId) {
        const amount = (line.debit || 0) - (line.credit || 0);
        await db
          .update(analyticalAccounts)
          .set({
            balance: sql`${analyticalAccounts.balance} + ${amount}`,
            updatedAt: new Date()
          })
          .where(eq(analyticalAccounts.id, line.analyticalAccountId));
      }
    }
    
    res.json({ success: true, message: 'تم ترحيل القيد بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== التقارير ====================

// ميزان المراجعة
router.get('/reports/trial-balance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const result = await db.execute(sql`
      SELECT 
        coa.code,
        coa.nameAr,
        coa.nameEn,
        SUM(jel.debit) as totalDebit,
        SUM(jel.credit) as totalCredit,
        SUM(jel.debit - jel.credit) as balance
      FROM ${chartOfAccounts} coa
      LEFT JOIN ${journalEntryLines} jel ON coa.id = jel.accountId
      LEFT JOIN ${journalEntries} je ON jel.journalEntryId = je.id
      WHERE je.isPosted = 1
        AND je.entryDate >= ${startDate}
        AND je.entryDate <= ${endDate}
      GROUP BY coa.id, coa.code, coa.nameAr, coa.nameEn
      HAVING totalDebit > 0 OR totalCredit > 0
      ORDER BY coa.code
    `);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// كشف حساب
router.get('/reports/account-statement/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate } = req.query;
    
    const result = await db
      .select({
        entryDate: journalEntries.entryDate,
        entryNumber: journalEntries.entryNumber,
        description: journalEntryLines.description,
        debit: journalEntryLines.debit,
        credit: journalEntryLines.credit,
        reference: journalEntries.reference
      })
      .from(journalEntryLines)
      .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
      .where(
        and(
          eq(journalEntryLines.accountId, parseInt(accountId)),
          eq(journalEntries.isPosted, true)
        )
      )
      .orderBy(journalEntries.entryDate);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
