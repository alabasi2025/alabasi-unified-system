import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { FileDown, Printer, Calendar, PieChart } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";

export default function IncomeStatement() {
  const { id } = useParams<{ id: string }>();
  const organizationId = parseInt(id || "0");
  const { user } = useAuth();

  // الفترة الزمنية
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  // TODO: جلب دليل الحسابات من API
  const accounts: any[] = [];

  // تصنيف الحسابات حسب النوع
  const revenues = accounts.filter((acc: any) => acc.type === 'إيرادات');
  const expenses = accounts.filter((acc: any) => acc.type === 'مصروفات');

  // بيانات تجريبية للأرصدة (سيتم ربطها بالقيود المحاسبية لاحقاً)
  const getBalance = (accountId: number) => {
    // TODO: حساب الرصيد الفعلي من القيود المحاسبية خلال الفترة
    return Math.floor(Math.random() * 50000);
  };

  // حساب المجاميع
  const totalRevenues = revenues.reduce((sum: any, acc: any) => sum + getBalance(acc.id), 0);
  const totalExpenses = expenses.reduce((sum: any, acc: any) => sum + getBalance(acc.id), 0);
  const netIncome = totalRevenues - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: تصدير إلى Excel
    console.log("Export to Excel");
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              قائمة الدخل
            </h1>
            <p className="text-muted-foreground mt-1">
              قائمة الأرباح والخسائر - الإيرادات والمصروفات وصافي الدخل
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              الفترة المحاسبية
            </CardTitle>
            <CardDescription>حدد الفترة الزمنية لقائمة الدخل</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">من تاريخ</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">إلى تاريخ</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income Statement */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" />
              قائمة الدخل التفصيلية
            </CardTitle>
            <CardDescription>
              من {new Date(fromDate).toLocaleDateString('ar-EG')} إلى {new Date(toDate).toLocaleDateString('ar-EG')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {/* Revenues Section */}
                <TableRow className="bg-green-100">
                  <TableCell colSpan={2} className="font-bold text-green-700 text-lg">
                    الإيرادات
                  </TableCell>
                </TableRow>
                {revenues.length > 0 ? (
                  <>
                    {revenues.map((account: any) => {
                      const balance = getBalance(account.id);
                      return (
                        <TableRow key={account.id} className="hover:bg-green-50/30">
                          <TableCell className="pr-8">
                            <div className="font-medium">{account.name}</div>
                            <div className="text-sm text-muted-foreground">{account.code}</div>
                          </TableCell>
                          <TableCell className="text-left font-semibold w-48">
                            {balance.toLocaleString('ar-EG')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-green-200 font-bold">
                      <TableCell className="pr-8">إجمالي الإيرادات</TableCell>
                      <TableCell className="text-left text-green-700 text-lg">
                        {totalRevenues.toLocaleString('ar-EG')}
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                      لا توجد حسابات إيرادات
                    </TableCell>
                  </TableRow>
                )}

                {/* Expenses Section */}
                <TableRow className="bg-red-100">
                  <TableCell colSpan={2} className="font-bold text-red-700 text-lg">
                    المصروفات
                  </TableCell>
                </TableRow>
                {expenses.length > 0 ? (
                  <>
                    {expenses.map((account: any) => {
                      const balance = getBalance(account.id);
                      return (
                        <TableRow key={account.id} className="hover:bg-red-50/30">
                          <TableCell className="pr-8">
                            <div className="font-medium">{account.name}</div>
                            <div className="text-sm text-muted-foreground">{account.code}</div>
                          </TableCell>
                          <TableCell className="text-left font-semibold">
                            ({balance.toLocaleString('ar-EG')})
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-red-200 font-bold">
                      <TableCell className="pr-8">إجمالي المصروفات</TableCell>
                      <TableCell className="text-left text-red-700 text-lg">
                        ({totalExpenses.toLocaleString('ar-EG')})
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                      لا توجد حسابات مصروفات
                    </TableCell>
                  </TableRow>
                )}

                {/* Net Income */}
                <TableRow className={`${
                  netIncome >= 0 
                    ? 'bg-gradient-to-r from-green-300 to-emerald-300' 
                    : 'bg-gradient-to-r from-red-300 to-rose-300'
                } font-bold text-lg`}>
                  <TableCell className="pr-8">
                    {netIncome >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                  </TableCell>
                  <TableCell className={`text-left text-xl ${
                    netIncome >= 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {netIncome >= 0 
                      ? netIncome.toLocaleString('ar-EG')
                      : `(${Math.abs(netIncome).toLocaleString('ar-EG')})`
                    }
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">إجمالي الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {totalRevenues.toLocaleString('ar-EG')}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {revenues.length} حساب إيراد
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">إجمالي المصروفات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">
                {totalExpenses.toLocaleString('ar-EG')}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {expenses.length} حساب مصروف
              </div>
            </CardContent>
          </Card>

          <Card className={`${
            netIncome >= 0 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
          }`}>
            <CardHeader>
              <CardTitle className={netIncome >= 0 ? 'text-green-700' : 'text-red-700'}>
                {netIncome >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                netIncome >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {Math.abs(netIncome).toLocaleString('ar-EG')}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {netIncome >= 0 ? 'ربح' : 'خسارة'} الفترة
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit Margin */}
        {totalRevenues > 0 && (
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle>نسب الربحية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">هامش الربح</div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {((netIncome / totalRevenues) * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">نسبة المصروفات إلى الإيرادات</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {((totalExpenses / totalRevenues) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
