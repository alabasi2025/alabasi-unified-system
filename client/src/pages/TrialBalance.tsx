import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Printer, Calendar } from "lucide-react";

export default function TrialBalance() {
  // تاريخ ميزان المراجعة
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  // بيانات وهمية لميزان المراجعة
  const balances = [
    { id: 1, code: '1010', name: 'النقدية بالصندوق', openingDebit: 50000, openingCredit: 0, periodDebit: 120000, periodCredit: 80000, closingDebit: 90000, closingCredit: 0 },
    { id: 2, code: '1020', name: 'البنك', openingDebit: 200000, openingCredit: 0, periodDebit: 300000, periodCredit: 250000, closingDebit: 250000, closingCredit: 0 },
    { id: 3, code: '2010', name: 'الموردون', openingDebit: 0, openingCredit: 30000, periodDebit: 20000, periodCredit: 50000, closingDebit: 0, closingCredit: 60000 },
    { id: 4, code: '3010', name: 'رأس المال', openingDebit: 0, openingCredit: 500000, periodDebit: 0, periodCredit: 0, closingDebit: 0, closingCredit: 500000 },
    { id: 5, code: '4010', name: 'إيرادات المبيعات', openingDebit: 0, openingCredit: 0, periodDebit: 0, periodCredit: 400000, closingDebit: 0, closingCredit: 400000 },
    { id: 6, code: '5010', name: 'مصروفات الرواتب', openingDebit: 0, openingCredit: 0, periodDebit: 150000, periodCredit: 0, closingDebit: 150000, closingCredit: 0 },
  ];

  const totals = {
    openingDebit: 250000,
    openingCredit: 530000,
    periodDebit: 590000,
    periodCredit: 780000,
    closingDebit: 490000,
    closingCredit: 960000,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    console.log("Export to Excel");
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">ميزان المراجعة</h1>
          <p className="text-muted-foreground mt-1">عرض أرصدة الحسابات خلال فترة محددة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="ml-2 h-4 w-4" />
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            الفترة الزمنية
          </CardTitle>
          <CardDescription>اختر الفترة الزمنية لعرض ميزان المراجعة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
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

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle>ميزان المراجعة</CardTitle>
          <CardDescription>من {fromDate} إلى {toDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-center font-semibold border-l" rowSpan={2}>رمز الحساب</TableHead>
                  <TableHead className="text-center font-semibold border-l" rowSpan={2}>اسم الحساب</TableHead>
                  <TableHead className="text-center font-semibold border-l" colSpan={2}>الرصيد الافتتاحي</TableHead>
                  <TableHead className="text-center font-semibold border-l" colSpan={2}>الحركة خلال الفترة</TableHead>
                  <TableHead className="text-center font-semibold" colSpan={2}>الرصيد الختامي</TableHead>
                </TableRow>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-center text-green-700 font-semibold border-l">مدين</TableHead>
                  <TableHead className="text-center text-red-700 font-semibold border-r">دائن</TableHead>
                  <TableHead className="text-center text-green-700 font-semibold border-l">مدين</TableHead>
                  <TableHead className="text-center text-red-700 font-semibold border-r">دائن</TableHead>
                  <TableHead className="text-center text-green-700 font-semibold border-l">مدين</TableHead>
                  <TableHead className="text-center text-red-700 font-semibold border-r">دائن</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => (
                  <TableRow key={balance.id} className="hover:bg-blue-50/50">
                    <TableCell className="text-center font-mono text-blue-600">{balance.code}</TableCell>
                    <TableCell className="font-medium">{balance.name}</TableCell>
                    <TableCell className="text-center text-green-700 border-l">
                      {balance.openingDebit > 0 ? balance.openingDebit.toLocaleString('ar-EG') : '-'}
                    </TableCell>
                    <TableCell className="text-center text-red-700 border-r">
                      {balance.openingCredit > 0 ? balance.openingCredit.toLocaleString('ar-EG') : '-'}
                    </TableCell>
                    <TableCell className="text-center text-green-700 border-l">
                      {balance.periodDebit > 0 ? balance.periodDebit.toLocaleString('ar-EG') : '-'}
                    </TableCell>
                    <TableCell className="text-center text-red-700 border-r">
                      {balance.periodCredit > 0 ? balance.periodCredit.toLocaleString('ar-EG') : '-'}
                    </TableCell>
                    <TableCell className="text-center text-green-700 border-l">
                      {balance.closingDebit > 0 ? balance.closingDebit.toLocaleString('ar-EG') : '-'}
                    </TableCell>
                    <TableCell className="text-center text-red-700 border-r">
                      {balance.closingCredit > 0 ? balance.closingCredit.toLocaleString('ar-EG') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow className="bg-blue-100 font-bold">
                  <TableCell colSpan={2} className="text-center">الإجمالي</TableCell>
                  <TableCell className="text-center text-green-700 border-l">
                    {totals.openingDebit.toLocaleString('ar-EG')}
                  </TableCell>
                  <TableCell className="text-center text-red-700 border-r">
                    {totals.openingCredit.toLocaleString('ar-EG')}
                  </TableCell>
                  <TableCell className="text-center text-green-700 border-l">
                    {totals.periodDebit.toLocaleString('ar-EG')}
                  </TableCell>
                  <TableCell className="text-center text-red-700 border-r">
                    {totals.periodCredit.toLocaleString('ar-EG')}
                  </TableCell>
                  <TableCell className="text-center text-green-700 border-l">
                    {totals.closingDebit.toLocaleString('ar-EG')}
                  </TableCell>
                  <TableCell className="text-center text-red-700 border-r">
                    {totals.closingCredit.toLocaleString('ar-EG')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
