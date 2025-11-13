import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { FileDown, Printer, Calendar, Search } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";

export default function AccountStatement() {
  const { id } = useParams<{ id: string }>();
  const organizationId = parseInt(id || "0");
  const { user } = useAuth();

  // الفلاتر
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  // TODO: جلب دليل الحسابات من API
  const accounts: any[] = [];

  // TODO: جلب كشف الحساب من API
  const statementData: any = null;
  const isLoading = false;

  const movements = statementData?.movements.map((movement: any, index: number) => ({
    id: index + 1,
    date: new Date(movement.entryDate).toISOString().split('T')[0],
    description: movement.description,
    reference: movement.entryNumber,
    debit: Number(movement.debit),
    credit: Number(movement.credit),
    balance: Number(movement.runningBalance),
  })) || [];

  // بيانات تجريبية قديمة (محذوفة)
  const movementsOld = selectedAccountId ? [
    {
      id: 1,
      date: '2025-01-15',
      description: 'رصيد افتتاحي',
      reference: '-',
      debit: 50000,
      credit: 0,
      balance: 50000,
    },
    {
      id: 2,
      date: '2025-01-20',
      description: 'صرف رواتب الموظفين',
      reference: 'سند صرف #001',
      debit: 0,
      credit: 15000,
      balance: 35000,
    },
    {
      id: 3,
      date: '2025-01-25',
      description: 'قبض من عميل',
      reference: 'سند قبض #001',
      debit: 20000,
      credit: 0,
      balance: 55000,
    },
  ] : [];

  const selectedAccount = accounts.find((acc: any) => acc.id === parseInt(selectedAccountId));

  // حساب المجاميع
  const totals = movements.reduce(
    (acc: any, item: any) => ({
      debit: acc.debit + item.debit,
      credit: acc.credit + item.credit,
    }),
    { debit: 0, credit: 0 }
  );

  const finalBalance = movements.length > 0 ? movements[movements.length - 1].balance : 0;

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              كشف حساب
            </h1>
            <p className="text-muted-foreground mt-1">
              عرض تفصيلي لحركات الحساب خلال فترة محددة
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} disabled={!selectedAccountId}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={!selectedAccountId}>
              <FileDown className="h-4 w-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-600" />
              معايير البحث
            </CardTitle>
            <CardDescription>حدد الحساب والفترة الزمنية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account">الحساب</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger id="account">
                    <SelectValue placeholder="اختر الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

        {/* Account Info */}
        {selectedAccount && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">رمز الحساب</div>
                  <div className="text-lg font-bold text-purple-700">{selectedAccount.code}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">اسم الحساب</div>
                  <div className="text-lg font-bold">{selectedAccount.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">نوع الحساب</div>
                  <div className="text-lg font-bold">{selectedAccount.type || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">الرصيد الحالي</div>
                  <div className="text-lg font-bold text-green-700">
                    {finalBalance.toLocaleString('ar-EG')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statement Table */}
        {selectedAccountId ? (
          <Card>
            <CardHeader>
              <CardTitle>حركات الحساب</CardTitle>
              <CardDescription>
                من {new Date(fromDate).toLocaleDateString('ar-EG')} إلى {new Date(toDate).toLocaleDateString('ar-EG')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {movements.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50">
                          <TableHead className="text-center font-bold">التاريخ</TableHead>
                          <TableHead className="text-center font-bold">البيان</TableHead>
                          <TableHead className="text-center font-bold">المرجع</TableHead>
                          <TableHead className="text-center font-bold text-green-700">مدين</TableHead>
                          <TableHead className="text-center font-bold text-red-700">دائن</TableHead>
                          <TableHead className="text-center font-bold text-blue-700">الرصيد</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movements.map((movement: any) => (
                          <TableRow key={movement.id} className="hover:bg-purple-50/50">
                            <TableCell className="text-center">
                              {new Date(movement.date).toLocaleDateString('ar-EG')}
                            </TableCell>
                            <TableCell>{movement.description}</TableCell>
                            <TableCell className="text-center text-muted-foreground">{movement.reference}</TableCell>
                            <TableCell className="text-center text-green-700 font-semibold">
                              {movement.debit > 0 ? movement.debit.toLocaleString('ar-EG') : '-'}
                            </TableCell>
                            <TableCell className="text-center text-red-700 font-semibold">
                              {movement.credit > 0 ? movement.credit.toLocaleString('ar-EG') : '-'}
                            </TableCell>
                            <TableCell className="text-center text-blue-700 font-bold">
                              {movement.balance.toLocaleString('ar-EG')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Totals Row */}
                        <TableRow className="bg-gradient-to-r from-purple-100 to-pink-100 font-bold">
                          <TableCell colSpan={3} className="text-center">الإجمالي</TableCell>
                          <TableCell className="text-center text-green-700">
                            {totals.debit.toLocaleString('ar-EG')}
                          </TableCell>
                          <TableCell className="text-center text-red-700">
                            {totals.credit.toLocaleString('ar-EG')}
                          </TableCell>
                          <TableCell className="text-center text-blue-700">
                            {finalBalance.toLocaleString('ar-EG')}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">إجمالي المدين</div>
                        <div className="text-2xl font-bold text-green-700">
                          {totals.debit.toLocaleString('ar-EG')}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">إجمالي الدائن</div>
                        <div className="text-2xl font-bold text-red-700">
                          {totals.credit.toLocaleString('ar-EG')}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">الرصيد النهائي</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {finalBalance.toLocaleString('ar-EG')}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد حركات لهذا الحساب في الفترة المحددة
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>اختر حساباً لعرض كشف الحساب</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
