import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, X, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/const";

export default function PaymentVoucher() {
  const [formData, setFormData] = useState({
    voucherType: "cash" as "cash" | "bank",
    branchId: "",
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    currencyId: "",
    date: new Date().toISOString().split("T")[0],
    statement: "",
    referenceNumber: "",
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedAccountBalance, setSelectedAccountBalance] = useState<number | null>(null);

  const { data: branches } = trpc.branches.list.useQuery();
  const { data: currencies } = trpc.currencies.list.useQuery();
  const { data: allAccounts } = trpc.analyticalAccounts.list.useQuery(
    formData.branchId ? { branchId: parseInt(formData.branchId) } : undefined,
    { enabled: !!formData.branchId }
  );
  const { data: chartAccounts } = trpc.chartOfAccounts.list.useQuery();
  const createMutation = trpc.vouchers.create.useMutation();

  // Filter accounts based on voucher type
  const fromAccounts = allAccounts?.filter((acc) => {
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

  const handleFromAccountChange = (value: string) => {
    setFormData({ ...formData, fromAccountId: value });
    const account = allAccounts?.find((acc) => acc.id === parseInt(value));
    if (account) {
      setSelectedAccountBalance(account.currentBalance || 0);
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

    // Check balance
    if (selectedAccountBalance !== null && amount * 100 > selectedAccountBalance) {
      toast.error("الرصيد غير كافٍ في الحساب المحدد");
      return;
    }

    try {
      // TODO: Upload image to S3 if exists
      let attachmentUrl = null;
      if (imageFile) {
        // For now, we'll skip image upload
        // In production, use storagePut from server
        toast.info("رفع الصور سيتم تفعيله قريبًا");
      }

      await createMutation.mutateAsync({
        type: "payment",
        voucherType: formData.voucherType,
        date: formData.date,
        amount: amount * 100,
        currencyId: parseInt(formData.currencyId),
        fromAccountId: parseInt(formData.fromAccountId),
        toAccountId: formData.toAccountId ? parseInt(formData.toAccountId) : undefined,
        branchId: parseInt(formData.branchId),
        statement: formData.statement,
        referenceNumber: formData.referenceNumber || undefined,
        attachmentUrl: attachmentUrl || undefined,
        notes: formData.notes || undefined,
      });

      toast.success("تم إنشاء سند الصرف بنجاح");

      // Reset form
      setFormData({
        voucherType: "cash",
        branchId: "",
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        currencyId: "",
        date: new Date().toISOString().split("T")[0],
        statement: "",
        referenceNumber: "",
        notes: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setSelectedAccountBalance(null);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء السند");
    }
  };

  const insufficientBalance =
    selectedAccountBalance !== null &&
    formData.amount &&
    parseFloat(formData.amount) * 100 > selectedAccountBalance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">سند صرف</h1>
        <p className="text-muted-foreground mt-1">تسجيل عملية صرف نقدية أو بنكية</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>بيانات السند</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1: Branch and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchId">الفرع *</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => setFormData({ ...formData, branchId: value, fromAccountId: "" })}
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
                    setFormData({ ...formData, voucherType: value, fromAccountId: "" })
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

            {/* Row 2: From Account */}
            <div className="space-y-2">
              <Label htmlFor="fromAccountId">
                {formData.voucherType === "cash" ? "الصرف من (الصندوق)" : "الصرف من (البنك)"} *
              </Label>
              <Select
                value={formData.fromAccountId}
                onValueChange={handleFromAccountChange}
                required
                disabled={formData.branchId === ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.branchId ? "اختر الحساب" : "اختر الفرع أولاً"} />
                </SelectTrigger>
                <SelectContent>
                  {fromAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.nameAr} - {formatCurrency(account.currentBalance || 0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAccountBalance !== null && (
                <p className="text-sm text-muted-foreground">
                  الرصيد المتاح: <span className="font-bold">{formatCurrency(selectedAccountBalance)}</span>
                </p>
              )}
            </div>

            {/* Row 3: To Account (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="toAccountId">الصرف إلى (الحساب)</Label>
              <Select value={formData.toAccountId} onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}>
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

            {/* Row 4: Amount and Currency */}
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
                {insufficientBalance && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>الرصيد غير كافٍ</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencyId">العملة *</Label>
                <Select
                  value={formData.currencyId}
                  onValueChange={(value) => setFormData({ ...formData, currencyId: value })}
                  required
                  disabled={formData.fromAccountId !== ""}
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

            {/* Row 5: Date and Reference */}
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

            {/* Row 6: Statement */}
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

            {/* Row 7: Notes */}
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

            {/* Row 8: Image Upload */}
            <div className="space-y-2">
              <Label>صورة الفاتورة</Label>
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
                    <p className="text-sm text-muted-foreground">اضغط لرفع صورة الفاتورة</p>
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

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !!insufficientBalance}>
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
