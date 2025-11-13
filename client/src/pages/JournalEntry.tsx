import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface JournalLine {
  id: string;
  accountId: number | null;
  type: "debit" | "credit";
  amount: number;
  description: string;
}

export default function JournalEntry() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<JournalLine[]>([
    { id: "1", accountId: null, type: "debit", amount: 0, description: "" },
    { id: "2", accountId: null, type: "credit", amount: 0, description: "" },
  ]);

  // Fetch data
  const { data: accounts, isLoading: accountsLoading } = trpc.analyticalAccounts.list.useQuery();
  const { data: branches } = trpc.branches.list.useQuery();
  const { data: currencies } = trpc.currencies.list.useQuery();
  
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | null>(null);

  // Set defaults when data loads
  useState(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      const mainBranch = branches.find(b => b.isMain) || branches[0];
      setSelectedBranchId(mainBranch.id);
    }
    if (currencies && currencies.length > 0 && !selectedCurrencyId) {
      const sarCurrency = currencies.find(c => c.code === "SAR") || currencies[0];
      setSelectedCurrencyId(sarCurrency.id);
    }
  });

  const createMutation = trpc.journalEntries.create.useMutation({
    onSuccess: (data) => {
      toast.success(`تم حفظ القيد اليومي بنجاح - رقم القيد: ${data.entryNumber}`);
      // Reset form
      setDescription("");
      setLines([
        { id: Date.now().toString(), accountId: null, type: "debit", amount: 0, description: "" },
        { id: (Date.now() + 1).toString(), accountId: null, type: "credit", amount: 0, description: "" },
      ]);
    },
    onError: (error) => {
      toast.error(error.message || "فشل حفظ القيد اليومي");
    },
  });

  const addLine = () => {
    const newLine: JournalLine = {
      id: Date.now().toString(),
      accountId: null,
      type: "debit",
      amount: 0,
      description: "",
    };
    setLines([...lines, newLine]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 2) {
      setLines(lines.filter(line => line.id !== id));
    } else {
      toast.error("يجب أن يحتوي القيد على طرفين على الأقل");
    }
  };

  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const calculateTotals = () => {
    const totalDebit = lines
      .filter(l => l.type === "debit")
      .reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    const totalCredit = lines
      .filter(l => l.type === "credit")
      .reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  };

  const handleSave = () => {
    if (!selectedBranchId) {
      toast.error("يرجى اختيار الفرع");
      return;
    }
    if (!selectedCurrencyId) {
      toast.error("يرجى اختيار العملة");
      return;
    }
    if (!description.trim()) {
      toast.error("يرجى إدخال وصف القيد");
      return;
    }

    const { totalDebit, totalCredit, difference } = calculateTotals();
    
    if (Math.abs(difference) > 0.01) {
      toast.error(`القيد غير متوازن. الفرق: ${difference.toFixed(2)}`);
      return;
    }

    // Validate all lines have accounts
    const invalidLines = lines.filter(l => !l.accountId || l.amount <= 0);
    if (invalidLines.length > 0) {
      toast.error("يرجى إكمال جميع الأسطر بشكل صحيح");
      return;
    }

    // Prepare data for API
    const apiLines = lines.map(line => ({
      accountId: line.accountId!,
      type: line.type,
      amount: line.amount,
      currencyId: selectedCurrencyId,
      description: line.description || description,
    }));

    createMutation.mutate({
      date,
      description,
      branchId: selectedBranchId,
      lines: apiLines,
    });
  };

  const { totalDebit, totalCredit, difference } = calculateTotals();
  const isBalanced = Math.abs(difference) < 0.01;

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            قيد يومي جديد
          </h1>
          <p className="text-muted-foreground mt-1">إنشاء قيد محاسبي يدوي</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!isBalanced || createMutation.isPending} 
          size="lg"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 ml-2" />
          )}
          حفظ القيد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات القيد</CardTitle>
          <CardDescription>أدخل تفاصيل القيد اليومي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">الفرع</Label>
              <Select
                value={selectedBranchId?.toString()}
                onValueChange={(value) => setSelectedBranchId(Number(value))}
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
              <Label htmlFor="currency">العملة</Label>
              <Select
                value={selectedCurrencyId?.toString()}
                onValueChange={(value) => setSelectedCurrencyId(Number(value))}
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
          <div className="space-y-2">
            <Label htmlFor="description">البيان</Label>
            <Textarea
              id="description"
              placeholder="وصف القيد اليومي..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>أطراف القيد</CardTitle>
              <CardDescription>أضف الحسابات المدينة والدائنة</CardDescription>
            </div>
            <Button onClick={addLine} variant="outline" size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة سطر
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lines.map((line, index) => (
              <div key={line.id} className="grid gap-4 md:grid-cols-12 items-end p-4 border rounded-lg">
                <div className="md:col-span-1 text-center font-semibold text-muted-foreground">
                  {index + 1}
                </div>
                <div className="md:col-span-4 space-y-2">
                  <Label>الحساب</Label>
                  <Select
                    value={line.accountId?.toString() || ""}
                    onValueChange={(value) => updateLine(line.id, "accountId", Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.code} - {account.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>النوع</Label>
                  <Select
                    value={line.type}
                    onValueChange={(value) => updateLine(line.id, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">مدين</SelectItem>
                      <SelectItem value="credit">دائن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>المبلغ</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.amount || ""}
                    onChange={(e) => updateLine(line.id, "amount", Number(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>البيان</Label>
                  <Input
                    value={line.description}
                    onChange={(e) => updateLine(line.id, "description", e.target.value)}
                    placeholder="اختياري"
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(line.id)}
                    disabled={lines.length <= 2}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="grid gap-2 md:grid-cols-3 text-lg font-semibold">
              <div className="flex justify-between">
                <span>إجمالي المدين:</span>
                <span className="text-blue-600">{totalDebit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي الدائن:</span>
                <span className="text-green-600">{totalCredit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>الفرق:</span>
                <span className={isBalanced ? "text-green-600" : "text-red-600"}>
                  {difference.toFixed(2)}
                  {isBalanced && " ✓"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
