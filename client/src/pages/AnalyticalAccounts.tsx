import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, Wallet, Building2, User, CreditCard, Package, Edit, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/const";

const typeIcons: Record<string, any> = {
  cash: Wallet,
  bank: Building2,
  exchanger: User,
  wallet: CreditCard,
  warehouse: Package,
};

const typeColors: Record<string, string> = {
  cash: "bg-green-100 text-green-700",
  bank: "bg-blue-100 text-blue-700",
  exchanger: "bg-purple-100 text-purple-700",
  wallet: "bg-orange-100 text-orange-700",
  warehouse: "bg-gray-100 text-gray-700",
};

export default function AnalyticalAccounts() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    chartAccountId: "",
    typeId: "",
    branchId: "",
    openingBalance: "0",
    currencyId: "",
    description: "",
  });

  const { data: accounts, isLoading, refetch } = trpc.analyticalAccounts.list.useQuery();
  const { data: types } = trpc.analyticalAccountTypes.list.useQuery();
  const { data: chartAccounts } = trpc.chartOfAccounts.list.useQuery();
  const { data: branches } = trpc.branches.list.useQuery();
  const { data: currencies } = trpc.currencies.list.useQuery();
  const createMutation = trpc.analyticalAccounts.create.useMutation();
  const updateMutation = trpc.analyticalAccounts.update.useMutation();

  const handleAddAccount = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      chartAccountId: "",
      typeId: "",
      branchId: "",
      openingBalance: "0",
      currencyId: "",
      description: "",
    });
    setSelectedAccount(null);
    setAddDialogOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setFormData({
      code: account.code,
      nameAr: account.nameAr,
      nameEn: account.nameEn || "",
      chartAccountId: account.chartAccountId?.toString() || "",
      typeId: account.typeId?.toString() || "",
      branchId: account.branchId?.toString() || "",
      openingBalance: (account.openingBalance / 100).toString(),
      currencyId: account.currencyId?.toString() || "",
      description: account.description || "",
    });
    setEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        code: formData.code,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || undefined,
        chartAccountId: parseInt(formData.chartAccountId),
        typeId: parseInt(formData.typeId),
        branchId: parseInt(formData.branchId),
        openingBalance: Math.round(parseFloat(formData.openingBalance) * 100),
        currencyId: parseInt(formData.currencyId),
        description: formData.description || undefined,
      });

      toast.success("تم إضافة الحساب التحليلي بنجاح");
      setAddDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إضافة الحساب");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedAccount.id,
        code: formData.code,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || undefined,
        description: formData.description || undefined,
      });

      toast.success("تم تحديث الحساب بنجاح");
      setEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الحساب");
    }
  };

  // Filter accounts
  const filteredAccounts = accounts?.filter((account) => {
    const matchesSearch = 
      account.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      selectedType === "all" || 
      account.typeId?.toString() === selectedType;
    
    return matchesSearch && matchesType;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8 text-green-600" />
            الصناديق والبنوك (الحسابات التحليلية)
          </h1>
          <p className="text-muted-foreground mt-1">إدارة الصناديق، البنوك، الصرافين، والمحافظ</p>
        </div>
        <Button onClick={handleAddAccount}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة حساب تحليلي
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في الحسابات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="pr-10">
                  <SelectValue placeholder="فلترة حسب النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {types?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>الحسابات ({filteredAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد حسابات تحليلية</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الرمز</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الفرع</TableHead>
                    <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    const type = types?.find((t) => t.id === account.typeId);
                    const TypeIcon = type?.code ? typeIcons[type.code] : Wallet;
                    const typeColor = type?.code ? typeColors[type.code] : "bg-gray-100 text-gray-700";
                    const branch = branches?.find((b) => b.id === account.branchId);
                    const currency = currencies?.find((c) => c.id === account.currencyId);

                    return (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono">{account.code}</TableCell>
                        <TableCell className="font-medium">{account.nameAr}</TableCell>
                        <TableCell>
                          <Badge className={typeColor} variant="secondary">
                            <TypeIcon className="ml-1 h-3 w-3" />
                            {type?.nameAr}
                          </Badge>
                        </TableCell>
                        <TableCell>{branch?.nameAr || "-"}</TableCell>
                        <TableCell>
                          {formatCurrency(account.openingBalance / 100)} {currency?.symbol}
                        </TableCell>
                        <TableCell>
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "نشط" : "معطل"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditAccount(account)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة حساب تحليلي جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">رمز الحساب *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="مثال: CASH001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeId">نوع الحساب *</Label>
                <Select
                  value={formData.typeId}
                  onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {types?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: صندوق الفرع الرئيسي"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Example: Main Branch Cash"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chartAccountId">الحساب الرئيسي *</Label>
                <Select
                  value={formData.chartAccountId}
                  onValueChange={(value) => setFormData({ ...formData, chartAccountId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartAccounts?.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.code} - {acc.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchId">الفرع *</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفرع" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currencyId">العملة *</Label>
                <Select
                  value={formData.currencyId}
                  onValueChange={(value) => setFormData({ ...formData, currencyId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العملة" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies?.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id.toString()}>
                        {currency.nameAr} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingBalance">الرصيد الافتتاحي</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  step="0.01"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف اختياري للحساب..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الحساب: {selectedAccount?.nameAr}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-code">رمز الحساب *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>النوع</Label>
                <Input
                  value={types?.find((t) => t.id.toString() === formData.typeId)?.nameAr || ""}
                  disabled
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-nameAr">الاسم بالعربية *</Label>
                <Input
                  id="edit-nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="edit-nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">الوصف</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  "تحديث"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
