import { drizzle } from "drizzle-orm/mysql2";
import { 
  currencies, 
  branches, 
  accountCategories, 
  analyticalAccountTypes 
} from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Starting seed...");

  // إضافة العملات
  console.log("Adding currencies...");
  await db.insert(currencies).values([
    { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", symbol: "ر.س", isActive: true },
    { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", symbol: "$", isActive: true },
    { code: "EUR", nameAr: "يورو", nameEn: "Euro", symbol: "€", isActive: true },
  ]).onDuplicateKeyUpdate({ set: { isActive: true } });

  // إضافة الفروع
  console.log("Adding branches...");
  await db.insert(branches).values([
    { code: "MAIN", nameAr: "الفرع الرئيسي", nameEn: "Main Branch", isMain: true, isActive: true },
  ]).onDuplicateKeyUpdate({ set: { isActive: true } });

  // إضافة أنواع الحسابات الرئيسية
  console.log("Adding account categories...");
  await db.insert(accountCategories).values([
    { code: "ASSET", nameAr: "الأصول", nameEn: "Assets", type: "asset" },
    { code: "LIABILITY", nameAr: "الخصوم", nameEn: "Liabilities", type: "liability" },
    { code: "EQUITY", nameAr: "حقوق الملكية", nameEn: "Equity", type: "equity" },
    { code: "REVENUE", nameAr: "الإيرادات", nameEn: "Revenue", type: "revenue" },
    { code: "EXPENSE", nameAr: "المصروفات", nameEn: "Expenses", type: "expense" },
  ]).onDuplicateKeyUpdate({ set: { nameAr: "الأصول" } });

  // إضافة أنواع الحسابات التحليلية
  console.log("Adding analytical account types...");
  await db.insert(analyticalAccountTypes).values([
    { code: "cash", nameAr: "صندوق", nameEn: "Cash", icon: "Wallet" },
    { code: "bank", nameAr: "بنك", nameEn: "Bank", icon: "Building2" },
    { code: "exchanger", nameAr: "صراف", nameEn: "Exchanger", icon: "User" },
    { code: "wallet", nameAr: "محفظة", nameEn: "Wallet", icon: "CreditCard" },
    { code: "customer", nameAr: "عميل", nameEn: "Customer", icon: "Users" },
    { code: "supplier", nameAr: "مورد", nameEn: "Supplier", icon: "Truck" },
    { code: "warehouse", nameAr: "مخزن", nameEn: "Warehouse", icon: "Package" },
  ]).onDuplicateKeyUpdate({ set: { nameAr: "صندوق" } });

  console.log("✅ Seed completed successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
