import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/const";

export default function ReceiptVoucher() {
  const [formData, setFormData] = useState({
    voucherType: "cash" as "cash" | "bank",
    branchId: "",
    toAccountId: "",
    fromAccountId: "",
    amount: "",
    currencyId: "",
    date: new Date().toISOString().split("T")[0],
    statement: "",
    referenceNumber: "",
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: branches } = trpc.branches.list.useQuery();
  const { data: currencies } = trpc.currencies.list.useQuery();
  const { data: allAccounts } = trpc.analyticalAccounts.list.useQuery(
    formData.branchId ? { branchId: parseInt(formData.branchId) } : undefined,
    { enabled: !!formData.branchId }
  );
  const { data: chartAccounts } = trpc.chartOfAccounts.list.useQuery();
  const createMutation = trpc.vouchers.create.useMutation();

  // Filter accounts based on voucher type
  const toAccounts = allAccounts?.filter((acc) => {
    if (formData.voucherType === "cash") {
      return acc.type?.code === "cash";
    } else {
      return acc.type?.code === "bank";
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleToAccountChange = (value: string) => {
    setFormData({ ...formData, toAccountId: value });
    const account = allAccounts?.find((acc) => acc.id === parseInt(value));
    if (account) {
      setFormData((prev) => ({ ...prev, currencyId: account.currencyId.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("المبلغ غير صحيح");
      return;
    }

    try {
      let attachmentUrl = null;
      if (imageFile) {
        toast.info("رفع الصور سيتم تفعيله قريبًا");
      }

      await createMutation.mutateAsync({
        type: "receipt",
        voucherType: formData.voucherType,
        date: formData.date,
        amount: amount * 100,
        currencyId: parseInt(formData.currencyId),
        toAccountId: parseInt(formData.toAccountId),
        fromAccountId: formData.fromAccountId ? parseInt(formData.fromAccountId) : undefined,
        branchId: parseInt(formData.branchId),
        statement: formData.statement,
        referenceNumber: formData.referenceNumber || undefined,
        attachmentUrl: attachmentUrl || undefined,
        notes: formData.notes || undefined,
      });

      toast.success("تم إنشاء سند القبض بنجاح");

      setFormData({
        voucherType: "cash",
        branchId: "",
        toAccountId: "",
        fromAccountId: "",
        amount: "",
        currencyId: "",
        date: new Date().toISOString().split("T")[0],
        statement: "",
        referenceNumber: "",
        notes: "",
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء السند");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">سند قبض</h1>
        <p className="text-muted-foreground mt-1">تسجيل عملية قبض نقدية أو بنكية</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>بيانات السند</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchId">الفرع *</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => setFormData({ ...formData, branchId: value, toAccountId: "" })}
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

              <div className="space-y-2">
                <Label htmlFor="voucherType">نوع السند *</Label>
                <Select
                  value={formData.voucherType}
                  onValueChange={(value: "cash" | "bank") =>
                    setFormData({ ...formData, voucherType: value, toAccountId: "" })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي (صندوق)</SelectItem>
                    <SelectItem value="bank">بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toAccountId">
                {formData.voucherType === "cash" ? "القبض في (الصندوق)" : "القبض في (البنك)"} *
              </Label>
              <Select
                value={formData.toAccountId}
                onValueChange={handleToAccountChange}
                required
                disabled={formData.branchId === ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.branchId ? "اختر الحساب" : "اختر الفرع أولاً"} />
                </SelectTrigger>
                <SelectContent>
                  {toAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.nameAr} - {formatCurrency(account.currentBalance || 0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromAccountId">القبض من (الحساب)</Label>
              <Select value={formData.fromAccountId} onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  {chartAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencyId">العملة *</Label>
                <Select
                  value={formData.currencyId}
                  onValueChange={(value) => setFormData({ ...formData, currencyId: value })}
                  required
                  disabled={formData.toAccountId !== ""}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">رقم المرجع</Label>
                <Input
                  id="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="رقم الفاتورة أو المرجع"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statement">البيان *</Label>
              <Textarea
                id="statement"
                value={formData.statement}
                onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                required
                placeholder="وصف تفصيلي للعملية"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية (اختياري)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>صورة الإيصال</Label>
              {!imagePreview ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">اضغط لرفع صورة الإيصال</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG حتى 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-contain rounded-lg border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <CheckCircle className="ml-2 h-4 w-4" />
                    حفظ السند
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
