import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  currencies,
  branches,
  accountCategories,
  chartOfAccounts,
  accountCurrencies,
  analyticalAccountTypes,
  analyticalAccounts,
  vouchers,
  journalEntries,
  journalEntryLines,
  employees,
  inventory,
  assets,
  aiConversations,
  units,
  organizations,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Currencies ============
export async function getAllCurrencies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(currencies).where(eq(currencies.isActive, true));
}

export async function getCurrencyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(currencies).where(eq(currencies.id, id)).limit(1);
  return result[0];
}

// ============ Branches ============
export async function getAllBranches() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(branches).where(eq(branches.isActive, true));
}

export async function getBranchById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
  return result[0];
}

export async function createBranch(data: typeof branches.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(branches).values(data);
  return result;
}

// ============ Account Categories ============
export async function getAllAccountCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accountCategories);
}

// ============ Chart of Accounts ============
export async function getAllChartOfAccounts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chartOfAccounts)
    .where(eq(chartOfAccounts.isActive, true))
    .orderBy(chartOfAccounts.code);
}

export async function getChartOfAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(chartOfAccounts).where(eq(chartOfAccounts.id, id)).limit(1);
  return result[0];
}

export async function createChartOfAccount(data: typeof chartOfAccounts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chartOfAccounts).values(data);
  return result;
}

export async function updateChartOfAccount(id: number, data: Partial<typeof chartOfAccounts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(chartOfAccounts).set(data).where(eq(chartOfAccounts.id, id));
}

// ============ Account Currencies ============
export async function getAccountCurrencies(accountId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: accountCurrencies.id,
      accountId: accountCurrencies.accountId,
      currencyId: accountCurrencies.currencyId,
      currency: currencies,
    })
    .from(accountCurrencies)
    .leftJoin(currencies, eq(accountCurrencies.currencyId, currencies.id))
    .where(eq(accountCurrencies.accountId, accountId));
}

export async function setAccountCurrencies(accountId: number, currencyIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete existing currencies
  await db.delete(accountCurrencies).where(eq(accountCurrencies.accountId, accountId));

  // Insert new currencies
  if (currencyIds.length > 0) {
    await db.insert(accountCurrencies).values(
      currencyIds.map((currencyId) => ({
        accountId,
        currencyId,
      }))
    );
  }
}

// ============ Analytical Account Types ============
export async function getAllAnalyticalAccountTypes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analyticalAccountTypes);
}

// ============ Analytical Accounts ============
export async function getAllAnalyticalAccounts(branchId?: number) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(analyticalAccounts.isActive, true)];
  if (branchId) {
    conditions.push(eq(analyticalAccounts.branchId, branchId));
  }

  return db
    .select({
      id: analyticalAccounts.id,
      code: analyticalAccounts.code,
      nameAr: analyticalAccounts.nameAr,
      nameEn: analyticalAccounts.nameEn,
      chartAccountId: analyticalAccounts.chartAccountId,
      typeId: analyticalAccounts.typeId,
      branchId: analyticalAccounts.branchId,
      openingBalance: analyticalAccounts.openingBalance,
      currentBalance: analyticalAccounts.currentBalance,
      currencyId: analyticalAccounts.currencyId,
      isActive: analyticalAccounts.isActive,
      description: analyticalAccounts.description,
      createdAt: analyticalAccounts.createdAt,
      chartAccount: chartOfAccounts,
      type: analyticalAccountTypes,
      branch: branches,
      currency: currencies,
    })
    .from(analyticalAccounts)
    .leftJoin(chartOfAccounts, eq(analyticalAccounts.chartAccountId, chartOfAccounts.id))
    .leftJoin(analyticalAccountTypes, eq(analyticalAccounts.typeId, analyticalAccountTypes.id))
    .leftJoin(branches, eq(analyticalAccounts.branchId, branches.id))
    .leftJoin(currencies, eq(analyticalAccounts.currencyId, currencies.id))
    .where(and(...conditions));
}

export async function getAnalyticalAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({
      id: analyticalAccounts.id,
      code: analyticalAccounts.code,
      nameAr: analyticalAccounts.nameAr,
      nameEn: analyticalAccounts.nameEn,
      chartAccountId: analyticalAccounts.chartAccountId,
      typeId: analyticalAccounts.typeId,
      branchId: analyticalAccounts.branchId,
      openingBalance: analyticalAccounts.openingBalance,
      currentBalance: analyticalAccounts.currentBalance,
      currencyId: analyticalAccounts.currencyId,
      isActive: analyticalAccounts.isActive,
      description: analyticalAccounts.description,
      createdAt: analyticalAccounts.createdAt,
      chartAccount: chartOfAccounts,
      type: analyticalAccountTypes,
      branch: branches,
      currency: currencies,
    })
    .from(analyticalAccounts)
    .leftJoin(chartOfAccounts, eq(analyticalAccounts.chartAccountId, chartOfAccounts.id))
    .leftJoin(analyticalAccountTypes, eq(analyticalAccounts.typeId, analyticalAccountTypes.id))
    .leftJoin(branches, eq(analyticalAccounts.branchId, branches.id))
    .leftJoin(currencies, eq(analyticalAccounts.currencyId, currencies.id))
    .where(eq(analyticalAccounts.id, id))
    .limit(1);
  return result[0];
}

export async function createAnalyticalAccount(data: typeof analyticalAccounts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(analyticalAccounts).values(data);
  return result;
}

export async function updateAnalyticalAccount(id: number, data: Partial<typeof analyticalAccounts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(analyticalAccounts).set(data).where(eq(analyticalAccounts.id, id));
}

export async function updateAccountBalance(accountId: number, amount: number, isDebit: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const account = await getAnalyticalAccountById(accountId);
  if (!account) throw new Error("Account not found");

  const newBalance = isDebit ? account.currentBalance + amount : account.currentBalance - amount;

  await db.update(analyticalAccounts).set({ currentBalance: newBalance }).where(eq(analyticalAccounts.id, accountId));
}

// ============ Vouchers ============
export async function getAllVouchers(branchId?: number, type?: "receipt" | "payment") {
  const db = await getDb();
  if (!db) return [];

  let conditions = [];
  if (branchId) conditions.push(eq(vouchers.branchId, branchId));
  if (type) conditions.push(eq(vouchers.type, type));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select({
      id: vouchers.id,
      voucherNumber: vouchers.voucherNumber,
      type: vouchers.type,
      voucherType: vouchers.voucherType,
      date: vouchers.date,
      amount: vouchers.amount,
      currencyId: vouchers.currencyId,
      fromAccountId: vouchers.fromAccountId,
      toAccountId: vouchers.toAccountId,
      branchId: vouchers.branchId,
      statement: vouchers.statement,
      referenceNumber: vouchers.referenceNumber,
      attachmentUrl: vouchers.attachmentUrl,
      status: vouchers.status,
      notes: vouchers.notes,
      createdAt: vouchers.createdAt,
      currency: currencies,
      branch: branches,
    })
    .from(vouchers)
    .leftJoin(currencies, eq(vouchers.currencyId, currencies.id))
    .leftJoin(branches, eq(vouchers.branchId, branches.id))
    .where(whereClause)
    .orderBy(desc(vouchers.date));
}

export async function getVoucherById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({
      id: vouchers.id,
      voucherNumber: vouchers.voucherNumber,
      type: vouchers.type,
      voucherType: vouchers.voucherType,
      date: vouchers.date,
      amount: vouchers.amount,
      currencyId: vouchers.currencyId,
      fromAccountId: vouchers.fromAccountId,
      toAccountId: vouchers.toAccountId,
      branchId: vouchers.branchId,
      statement: vouchers.statement,
      referenceNumber: vouchers.referenceNumber,
      attachmentUrl: vouchers.attachmentUrl,
      status: vouchers.status,
      notes: vouchers.notes,
      createdAt: vouchers.createdAt,
      currency: currencies,
      branch: branches,
      fromAccount: analyticalAccounts,
      toAccount: analyticalAccounts,
    })
    .from(vouchers)
    .leftJoin(currencies, eq(vouchers.currencyId, currencies.id))
    .leftJoin(branches, eq(vouchers.branchId, branches.id))
    .leftJoin(analyticalAccounts, eq(vouchers.fromAccountId, analyticalAccounts.id))
    .leftJoin(analyticalAccounts, eq(vouchers.toAccountId, analyticalAccounts.id))
    .where(eq(vouchers.id, id))
    .limit(1);
  return result[0];
}

export async function createVoucher(data: typeof vouchers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vouchers).values(data);
  return result;
}

// ============ Journal Entries ============
export async function createJournalEntry(
  entryData: typeof journalEntries.$inferInsert,
  lines: Array<typeof journalEntryLines.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Insert journal entry
  const entryResult = await db.insert(journalEntries).values(entryData);
  const entryId = Number((entryResult as any).insertId);

  // Insert journal entry lines
  const linesWithEntryId = lines.map((line) => ({
    ...line,
    entryId,
  }));
  await db.insert(journalEntryLines).values(linesWithEntryId);

  return entryId;
}

export async function getAllJournalEntries(branchId?: number) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [];
  if (branchId) {
    conditions.push(eq(journalEntries.branchId, branchId));
  }

  const entries = await db
    .select()
    .from(journalEntries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(journalEntries.date));

  return entries;
}

export async function getJournalEntryById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const entry = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);
  if (entry.length === 0) return null;

  const lines = await db.select().from(journalEntryLines).where(eq(journalEntryLines.entryId, id));

  return {
    ...entry[0],
    lines,
  };
}

export async function getJournalEntryLines(entryId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: journalEntryLines.id,
      entryId: journalEntryLines.entryId,
      accountId: journalEntryLines.accountId,
      accountName: analyticalAccounts.nameAr,
      type: journalEntryLines.type,
      amount: journalEntryLines.amount,
      currencyId: journalEntryLines.currencyId,
      description: journalEntryLines.description,
    })
    .from(journalEntryLines)
    .leftJoin(analyticalAccounts, eq(journalEntryLines.accountId, analyticalAccounts.id))
    .where(eq(journalEntryLines.entryId, entryId));
}

// ============ AI Conversations ============
export async function saveAiConversation(data: typeof aiConversations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(aiConversations).values(data);
}

export async function getAiConversations(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.userId, userId))
    .orderBy(desc(aiConversations.createdAt))
    .limit(limit);
}

// ============ Dashboard Stats ============
export async function getDashboardStats(branchId?: number) {
  const db = await getDb();
  if (!db) return null;

  // Get total cash balance (sum of all cash accounts)
  let cashConditions = [
    eq(analyticalAccounts.isActive, true),
    eq(analyticalAccountTypes.code, "cash")
  ];
  if (branchId) {
    cashConditions.push(eq(analyticalAccounts.branchId, branchId));
  }

  const cashAccountsQuery = db
    .select({
      total: sql<number>`SUM(${analyticalAccounts.currentBalance})`,
    })
    .from(analyticalAccounts)
    .leftJoin(analyticalAccountTypes, eq(analyticalAccounts.typeId, analyticalAccountTypes.id))
    .where(and(...cashConditions));

  const cashResult = await cashAccountsQuery;
  const totalCash = cashResult[0]?.total || 0;

  // Get revenue (sum of all receipt vouchers)
  let revenueConditions = [
    eq(vouchers.type, "receipt" as const),
    eq(vouchers.status, "approved" as const)
  ];
  if (branchId) {
    revenueConditions.push(eq(vouchers.branchId, branchId));
  }

  const revenueQuery = db
    .select({
      total: sql<number>`SUM(${vouchers.amount})`,
    })
    .from(vouchers)
    .where(and(...revenueConditions));

  const revenueResult = await revenueQuery;
  const totalRevenue = revenueResult[0]?.total || 0;

  // Get expenses (sum of all payment vouchers)
  let expensesConditions = [
    eq(vouchers.type, "payment" as const),
    eq(vouchers.status, "approved" as const)
  ];
  if (branchId) {
    expensesConditions.push(eq(vouchers.branchId, branchId));
  }

  const expensesQuery = db
    .select({
      total: sql<number>`SUM(${vouchers.amount})`,
    })
    .from(vouchers)
    .where(and(...expensesConditions));

  const expensesResult = await expensesQuery;
  const totalExpenses = expensesResult[0]?.total || 0;

  const netProfit = totalRevenue - totalExpenses;

  return {
    totalCash,
    totalRevenue,
    totalExpenses,
    netProfit,
  };
}

// ============ Units ============
export async function getAllUnits() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(units).where(eq(units.isActive, true));
}

export async function getUnitById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(units).where(eq(units.id, id)).limit(1);
  return result[0] || null;
}

export async function createUnit(data: typeof units.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(units).values(data);
}

export async function updateUnit(id: number, data: Partial<typeof units.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(units).set(data).where(eq(units.id, id));
}

export async function deleteUnit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(units).set({ isActive: false }).where(eq(units.id, id));
}

// ============ Organizations ============
export async function getAllOrganizations(unitId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let conditions = [eq(organizations.isActive, true)];
  if (unitId) {
    conditions.push(eq(organizations.unitId, unitId));
  }
  
  return db.select().from(organizations).where(and(...conditions));
}

export async function getOrganizationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return result[0] || null;
}

export async function createOrganization(data: typeof organizations.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(organizations).values(data);
}

export async function updateOrganization(id: number, data: Partial<typeof organizations.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(organizations).set(data).where(eq(organizations.id, id));
}

export async function deleteOrganization(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(organizations).set({ isActive: false }).where(eq(organizations.id, id));
}
