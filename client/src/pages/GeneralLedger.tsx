import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { FileDown, Printer, Calendar, BookOpen } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";

export default function GeneralLedger() {
  const { id } = useParams<{ id: string }>();
  const organizationId = parseInt(id || "0");
  const { user } = useAuth();

  // الفترة الزمنية
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  // TODO: جلب دليل الحسابات من API
  const accounts: any[] = [];

  // بيانات تجريبية (سيتم ربطها بالقيود المحاسبية لاحقاً)
  const getLedgerData = () => {    return accounts.map((account: any) => {      // TODO: جلب الحركات الفعلية من القيود المحاسبية
      const movements = [
        {
          id: 1,
          date: '2025-01-15',
          description: 'رصيد افتتاحي',
          reference: '-',
          debit: 10000,
          credit: 0,
        },
        {
          id: 2,
          date: '2025-01-20',
          description: 'عملية محاسبية',
          reference: 'قيد #001',
          debit: 0,
          credit: 3000,
        },
      ];

      const totalDebit = movements.reduce((sum: any, m: any) => sum + m.debit, 0);
      const totalCredit = movements.reduce((sum: any, m: any) => sum + m.credit, 0);
      const balance = totalDebit - totalCredit;

      return {
        account,
        movements,
        totalDebit,
        totalCredit,
        balance,
      };
    }).filter(item => item.movements.length > 0); // عرض الحسابات التي لها حركات فقط
  };

  const ledgerData = getLedgerData();

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              دفتر الأستاذ العام
            </h1>
            <p className="text-muted-foreground mt-1">
              عرض شامل لجميع حركات الحسابات خلال الفترة المحددة
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              الفترة المحاسبية
            </CardTitle>
            <CardDescription>حدد الفترة الزمنية لدفتر الأستاذ</CardDescription>
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

        {/* Ledger Entries */}
        <div className="space-y-6">
          {ledgerData.length > 0 ? (
            ledgerData.map((item: any) => (
              <Card key={item.account.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <BookOpen className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {item.account.code} - {item.account.name}
                        </CardTitle>
                        <CardDescription>
                          {item.account.type || 'غير محدد'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-muted-foreground">الرصيد</div>
                      <div className={`text-xl font-bold ${item.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {Math.abs(item.balance).toLocaleString('ar-EG')}
                        <span className="text-sm mr-1">
                          {item.balance >= 0 ? 'مدين' : 'دائن'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-orange-50/50">
                        <TableHead className="text-center font-bold">التاريخ</TableHead>
                        <TableHead className="text-center font-bold">البيان</TableHead>
                        <TableHead className="text-center font-bold">المرجع</TableHead>
                        <TableHead className="text-center font-bold text-green-700">مدين</TableHead>
                        <TableHead className="text-center font-bold text-red-700">دائن</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.movements.map((movement: any) => (
                        <TableRow key={movement.id} className="hover:bg-orange-50/30">
                          <TableCell className="text-center">
                            {new Date(movement.date).toLocaleDateString('ar-EG')}
                          </TableCell>
                          <TableCell>{movement.description}</TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {movement.reference}
                          </TableCell>
                          <TableCell className="text-center text-green-700 font-semibold">
                            {movement.debit > 0 ? movement.debit.toLocaleString('ar-EG') : '-'}
                          </TableCell>
                          <TableCell className="text-center text-red-700 font-semibold">
                            {movement.credit > 0 ? movement.credit.toLocaleString('ar-EG') : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Totals Row */}
                      <TableRow className="bg-orange-100 font-bold">
                        <TableCell colSpan={3} className="text-center">الإجمالي</TableCell>
                        <TableCell className="text-center text-green-700">
                          {item.totalDebit.toLocaleString('ar-EG')}
                        </TableCell>
                        <TableCell className="text-center text-red-700">
                          {item.totalCredit.toLocaleString('ar-EG')}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد حركات محاسبية في الفترة المحددة</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary */}
        {ledgerData.length > 0 && (
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardHeader>
              <CardTitle>ملخص دفتر الأستاذ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">عدد الحسابات</div>
                  <div className="text-2xl font-bold text-orange-700">
                    {ledgerData.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">إجمالي المدين</div>
                  <div className="text-2xl font-bold text-green-700">
                    {ledgerData.reduce((sum: any, item: any) => sum + item.totalDebit, 0).toLocaleString('ar-EG')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">إجمالي الدائن</div>
                  <div className="text-2xl font-bold text-red-700">
                    {ledgerData.reduce((sum: any, item: any) => sum + item.totalCredit, 0).toLocaleString('ar-EG')}
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
