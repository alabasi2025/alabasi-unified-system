import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Inventory() {
  // بيانات وهمية للعرض
  const items = [
    { id: 1, code: "PRD001", name: "منتج أ", category: "فئة 1", quantity: 150, unit: "قطعة", price: 50, value: 7500 },
    { id: 2, code: "PRD002", name: "منتج ب", category: "فئة 1", quantity: 80, unit: "قطعة", price: 120, value: 9600 },
    { id: 3, code: "PRD003", name: "منتج ج", category: "فئة 2", quantity: 200, unit: "كرتون", price: 35, value: 7000 },
    { id: 4, code: "PRD004", name: "منتج د", category: "فئة 2", quantity: 50, unit: "قطعة", price: 200, value: 10000 },
    { id: 5, code: "PRD005", name: "منتج هـ", category: "فئة 3", quantity: 10, unit: "قطعة", price: 500, value: 5000 },
  ];

  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity < 50).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-green-600" />
            إدارة المخزون
          </h1>
          <p className="text-muted-foreground mt-1">إدارة المنتجات والمخزون</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي قيمة المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الأصناف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()} صنف</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">أصناف منخفضة المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن منتج..."
                className="pr-10"
              />
            </div>
            <Button variant="outline">تصفية</Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <CardDescription>جميع المنتجات في المخزون</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-right font-semibold">الكود</th>
                  <th className="p-3 text-right font-semibold">اسم المنتج</th>
                  <th className="p-3 text-right font-semibold">الفئة</th>
                  <th className="p-3 text-center font-semibold">الكمية</th>
                  <th className="p-3 text-center font-semibold">الوحدة</th>
                  <th className="p-3 text-center font-semibold">السعر</th>
                  <th className="p-3 text-center font-semibold">القيمة</th>
                  <th className="p-3 text-center font-semibold">الحالة</th>
                  <th className="p-3 text-center font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-right font-mono text-sm">{item.code}</td>
                    <td className="p-3 text-right font-medium">{item.name}</td>
                    <td className="p-3 text-right text-muted-foreground">{item.category}</td>
                    <td className="p-3 text-center font-semibold">{item.quantity}</td>
                    <td className="p-3 text-center text-muted-foreground">{item.unit}</td>
                    <td className="p-3 text-center">{item.price.toLocaleString()} ر.س</td>
                    <td className="p-3 text-center font-semibold">{item.value.toLocaleString()} ر.س</td>
                    <td className="p-3 text-center">
                      {item.quantity < 50 ? (
                        <Badge variant="destructive">منخفض</Badge>
                      ) : item.quantity < 100 ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">متوسط</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">جيد</Badge>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
