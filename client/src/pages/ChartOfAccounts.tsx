import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Loader2, FolderTree, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { AccountTree } from "@/components/AccountTree";
import type { ChartOfAccount } from "../../../drizzle/schema";

export default function ChartOfAccounts() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    parentId: null as number | null,
    categoryId: "",
    isParent: false,
    description: "",
    currencyIds: [] as number[],
  });

  const { data: accounts, isLoading, refetch } = trpc.chartOfAccounts.list.useQuery();
  const { data: categories } = trpc.accountCategories.list.useQuery();
  const { data: currencies } = trpc.currencies.list.useQuery();
  const createMutation = trpc.chartOfAccounts.create.useMutation();
  const updateMutation = trpc.chartOfAccounts.update.useMutation();

  const handleAddAccount = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      parentId: null,
      categoryId: "",
      isParent: false,
      description: "",
      currencyIds: [],
    });
    setSelectedAccount(null);
    setAddDialogOpen(true);
  };

  const handleAddChildAccount = (parentAccount: ChartOfAccount) => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      parentId: parentAccount.id,
      categoryId: parentAccount.categoryId?.toString() || "",
      isParent: false,
      description: "",
      currencyIds: [],
    });
    setSelectedAccount(parentAccount);
    setAddDialogOpen(true);
  };

  const handleEditAccount = async (account: ChartOfAccount) => {
    setSelectedAccount(account);
    
    // Fetch currencies for this account
    const accountCurrencies = await trpc.chartOfAccounts.getCurrencies.useQuery(account.id);
    
    setFormData({
      code: account.code,
      nameAr: account.nameAr,
      nameEn: account.nameEn || "",
      parentId: account.parentId,
      categoryId: account.categoryId?.toString() || "",
      isParent: account.isParent,
      description: account.description || "",
      currencyIds: [], // Will be loaded from API
    });
    setEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.currencyIds.length === 0) {
      toast.error("يجب اختيار عملة واحدة على الأقل");
      return;
    }

    try {
      await createMutation.mutateAsync({
        code: formData.code,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || undefined,
        parentId: formData.parentId || undefined,
        categoryId: parseInt(formData.categoryId),
        level: formData.parentId ? 2 : 1,
        isParent: formData.isParent,
        description: formData.description || undefined,
        currencyIds: formData.currencyIds,
      });

      toast.success("تم إضافة الحساب بنجاح");
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
        currencyIds: formData.currencyIds.length > 0 ? formData.currencyIds : undefined,
      });

      toast.success("تم تحديث الحساب بنجاح");
      setEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الحساب");
    }
  };

  const toggleCurrency = (currencyId: number) => {
    setFormData((prev) => ({
      ...prev,
      currencyIds: prev.currencyIds.includes(currencyId)
        ? prev.currencyIds.filter((id) => id !== currencyId)
        : [...prev.currencyIds, currencyId],
    }));
  };

  // Filter accounts
  const filteredAccounts = accounts?.filter((account) => {
    const matchesSearch = 
      account.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      filterCategory === "all" || 
      account.categoryId?.toString() === filterCategory;
    
    return matchesSearch && matchesCategory;
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
            <FolderTree className="h-8 w-8 text-blue-600" />
            دليل الحسابات
          </h1>
          <p className="text-muted-foreground mt-1">إدارة الحسابات الرئيسية والفرعية بشكل هرمي</p>
        </div>
        <Button onClick={handleAddAccount}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة حساب رئيسي
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
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="pr-10">
                  <SelectValue placeholder="فلترة حسب النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Tree */}
      <Card>
        <CardHeader>
          <CardTitle>الحسابات ({filteredAccounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountTree
            accounts={filteredAccounts}
            onEdit={handleEditAccount}
            onAddChild={handleAddChildAccount}
          />
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formData.parentId ? `إضافة حساب فرعي تحت: ${selectedAccount?.nameAr}` : "إضافة حساب رئيسي"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">رمز الحساب *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="مثال: 1010"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">نوع الحساب *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  disabled={!!formData.parentId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nameAr}
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
                  placeholder="مثال: النقدية"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Example: Cash"
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

            {!formData.parentId && (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="isParent"
                  checked={formData.isParent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isParent: checked as boolean })
                  }
                />
                <Label htmlFor="isParent" className="cursor-pointer">
                  حساب رئيسي (يمكن إضافة حسابات فرعية تحته)
                </Label>
              </div>
            )}

            <div className="space-y-2">
              <Label>العملات المدعومة *</Label>
              <div className="grid grid-cols-2 gap-2">
                {currencies?.map((currency) => (
                  <div key={currency.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`currency-${currency.id}`}
                      checked={formData.currencyIds.includes(currency.id)}
                      onCheckedChange={() => toggleCurrency(currency.id)}
                    />
                    <Label htmlFor={`currency-${currency.id}`} className="cursor-pointer">
                      {currency.nameAr} ({currency.symbol})
                    </Label>
                  </div>
                ))}
              </div>
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
                <Label>نوع الحساب</Label>
                <Input
                  value={categories?.find((c) => c.id.toString() === formData.categoryId)?.nameAr || ""}
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
