import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/const";
import { FileText, Search, Filter, Download } from "lucide-react";
import { Link } from "wouter";

export default function VouchersList() {
  const [filters, setFilters] = useState({
    type: "all" as "all" | "payment" | "receipt",
    voucherType: "all" as "all" | "cash" | "bank",
    branchId: "",
    startDate: "",
    endDate: "",
    searchTerm: "",
  });

  const { data: vouchers, isLoading } = trpc.vouchers.list.useQuery({
    type: filters.type !== "all" ? filters.type : undefined,
    branchId: filters.branchId ? parseInt(filters.branchId) : undefined,
  });

  const { data: branches } = trpc.branches.list.useQuery();

  // Filter by search term (client-side)
  const filteredVouchers = vouchers?.filter((voucher) => {
    if (!filters.searchTerm) return true;
    const searchLower = filters.searchTerm.toLowerCase();
    return (
      voucher.voucherNumber.toLowerCase().includes(searchLower) ||
      voucher.statement.toLowerCase().includes(searchLower) ||
      voucher.referenceNumber?.toLowerCase().includes(searchLower)
    );
  });

  const getTypeLabel = (type: string) => {
    return type === "payment" ? "صرف" : "قبض";
  };

  const getVoucherTypeLabel = (voucherType: string) => {
    return voucherType === "cash" ? "نقدي" : "بنكي";
  };

  const getTypeBadgeVariant = (type: string) => {
    return type === "payment" ? "destructive" : "default";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">السندات</h1>
          <p className="text-muted-foreground mt-1">عرض وإدارة جميع سندات القبض والصرف</p>
        </div>
        <div className="flex gap-2">
          <Link href="/payment-voucher">
            <Button variant="outline">
              <FileText className="ml-2 h-4 w-4" />
              سند صرف
            </Button>
          </Link>
          <Link href="/receipt-voucher">
            <Button>
              <FileText className="ml-2 h-4 w-4" />
              سند قبض
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            التصفية والبحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع السند</label>
              <Select
                value={filters.type}
                onValueChange={(value: any) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="payment">صرف</SelectItem>
                  <SelectItem value="receipt">قبض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">النوع</label>
              <Select
                value={filters.voucherType}
                onValueChange={(value: any) => setFilters({ ...filters, voucherType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="bank">بنكي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الفرع</label>
              <Select
                value={filters.branchId}
                onValueChange={(value) => setFilters({ ...filters, branchId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  {branches?.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">من تاريخ</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">بحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="رقم السند أو البيان..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة السندات ({filteredVouchers?.length || 0})</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : filteredVouchers && filteredVouchers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم السند</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>البيان</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحساب</TableHead>
                    <TableHead>الفرع</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={getTypeBadgeVariant(voucher.type)}>
                            {getTypeLabel(voucher.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getVoucherTypeLabel(voucher.voucherType)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(voucher.date).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell className="max-w-xs truncate">{voucher.statement}</TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(voucher.amount)}
                      </TableCell>
                      <TableCell>
                        -
                      </TableCell>
                      <TableCell>{voucher.branch?.nameAr}</TableCell>
                      <TableCell>
                        <Badge variant={voucher.status === "approved" ? "default" : "secondary"}>
                          {voucher.status === "approved" ? "معتمد" : voucher.status === "draft" ? "مسودة" : "ملغي"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد سندات</p>
              <p className="text-sm text-muted-foreground mt-1">ابدأ بإنشاء سند صرف أو قبض</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
