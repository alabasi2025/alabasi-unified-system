import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { FileDown, Printer, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";

export default function BalanceSheet() {
  const { id } = useParams<{ id: string }>();
  const organizationId = parseInt(id || "0");
  const { user } = useAuth();

  // تاريخ القائمة
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  // TODO: جلب دليل الحسابات من API
  const accounts: any[] = [];

  // تصنيف الحسابات حسب النوع
  const assets = accounts.filter((acc: any) => acc.type === 'أصول');
  const liabilities = accounts.filter((acc: any) => acc.type === 'خصوم');
  const equity = accounts.filter((acc: any) => acc.type === 'حقوق ملكية');

  // بيانات تجريبية للأرصدة (سيتم ربطها بالقيود المحاسبية لاحقاً)
  const getBalance = (accountId: number) => {
    // TODO: حساب الرصيد الفعلي من القيود المحاسبية
    return Math.floor(Math.random() * 100000);
  };

  // حساب المجاميع
  const totalAssets = assets.reduce((sum: any, acc: any) => sum + getBalance(acc.id), 0);
  const totalLiabilities = liabilities.reduce((sum: any, acc: any) => sum + getBalance(acc.id), 0);
  const totalEquity = equity.reduce((sum: any, acc: any) => sum + getBalance(acc.id), 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              قائمة المركز المالي
            </h1>
            <p className="text-muted-foreground mt-1">
              الميزانية العمومية - الأصول والخصوم وحقوق الملكية
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
              <Calendar className="h-5 w-5 text-emerald-600" />
              تاريخ القائمة
            </CardTitle>
            <CardDescription>حدد التاريخ الذي تريد عرض المركز المالي فيه</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Label htmlFor="asOfDate">كما في تاريخ</Label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Balance Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                الأصول
              </CardTitle>
              <CardDescription>
                كما في {new Date(asOfDate).toLocaleDateString('ar-EG')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-emerald-50/50">
                    <TableHead className="font-bold">الحساب</TableHead>
                    <TableHead className="text-left font-bold">الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.length > 0 ? (
                    <>
                      {assets.map((account: any) => {
                        const balance = getBalance(account.id);
                        return (
                          <TableRow key={account.id} className="hover:bg-emerald-50/30">
                            <TableCell>
                              <div className="font-medium">{account.name}</div>
                              <div className="text-sm text-muted-foreground">{account.code}</div>
                            </TableCell>
                            <TableCell className="text-left font-semibold">
                              {balance.toLocaleString('ar-EG')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-emerald-100 font-bold">
                        <TableCell>إجمالي الأصول</TableCell>
                        <TableCell className="text-left text-emerald-700 text-lg">
                          {totalAssets.toLocaleString('ar-EG')}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        لا توجد حسابات أصول
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Liabilities and Equity */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-600" />
                الخصوم وحقوق الملكية
              </CardTitle>
              <CardDescription>
                كما في {new Date(asOfDate).toLocaleDateString('ar-EG')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-rose-50/50">
                    <TableHead className="font-bold">الحساب</TableHead>
                    <TableHead className="text-left font-bold">الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Liabilities */}
                  {liabilities.length > 0 && (
                    <>
                      <TableRow className="bg-rose-100/50">
                        <TableCell colSpan={2} className="font-bold text-rose-700">
                          الخصوم
                        </TableCell>
                      </TableRow>
                      {liabilities.map((account: any) => {
                        const balance = getBalance(account.id);
                        return (
                          <TableRow key={account.id} className="hover:bg-rose-50/30">
                            <TableCell>
                              <div className="font-medium">{account.name}</div>
                              <div className="text-sm text-muted-foreground">{account.code}</div>
                            </TableCell>
                            <TableCell className="text-left font-semibold">
                              {balance.toLocaleString('ar-EG')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-rose-100 font-bold">
                        <TableCell>إجمالي الخصوم</TableCell>
                        <TableCell className="text-left">
                          {totalLiabilities.toLocaleString('ar-EG')}
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {/* Equity */}
                  {equity.length > 0 && (
                    <>
                      <TableRow className="bg-purple-100/50">
                        <TableCell colSpan={2} className="font-bold text-purple-700">
                          حقوق الملكية
                        </TableCell>
                      </TableRow>
                      {equity.map((account: any) => {
                        const balance = getBalance(account.id);
                        return (
                          <TableRow key={account.id} className="hover:bg-purple-50/30">
                            <TableCell>
                              <div className="font-medium">{account.name}</div>
                              <div className="text-sm text-muted-foreground">{account.code}</div>
                            </TableCell>
                            <TableCell className="text-left font-semibold">
                              {balance.toLocaleString('ar-EG')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-purple-100 font-bold">
                        <TableCell>إجمالي حقوق الملكية</TableCell>
                        <TableCell className="text-left">
                          {totalEquity.toLocaleString('ar-EG')}
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {/* Total */}
                  <TableRow className="bg-gradient-to-r from-rose-200 to-purple-200 font-bold">
                    <TableCell>إجمالي الخصوم وحقوق الملكية</TableCell>
                    <TableCell className="text-left text-rose-700 text-lg">
                      {totalLiabilitiesAndEquity.toLocaleString('ar-EG')}
                    </TableCell>
                  </TableRow>

                  {liabilities.length === 0 && equity.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        لا توجد حسابات خصوم أو حقوق ملكية
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Balance Check */}
        <Card className={`border-2 ${
          totalAssets === totalLiabilitiesAndEquity 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">حالة التوازن</div>
                <div className="text-2xl font-bold">
                  {totalAssets === totalLiabilitiesAndEquity ? (
                    <span className="text-green-700">✓ القائمة متوازنة</span>
                  ) : (
                    <span className="text-red-700">✗ القائمة غير متوازنة</span>
                  )}
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm text-muted-foreground mb-1">الفرق</div>
                <div className={`text-2xl font-bold ${
                  totalAssets === totalLiabilitiesAndEquity ? 'text-green-700' : 'text-red-700'
                }`}>
                  {Math.abs(totalAssets - totalLiabilitiesAndEquity).toLocaleString('ar-EG')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle>ملخص المركز المالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">إجمالي الأصول</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {totalAssets.toLocaleString('ar-EG')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">إجمالي الخصوم</div>
                <div className="text-2xl font-bold text-rose-700">
                  {totalLiabilities.toLocaleString('ar-EG')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">إجمالي حقوق الملكية</div>
                <div className="text-2xl font-bold text-purple-700">
                  {totalEquity.toLocaleString('ar-EG')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
