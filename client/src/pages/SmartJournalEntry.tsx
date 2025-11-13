import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Sparkles, Check, X, AlertCircle, Plus, Trash2, FileText, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export default function SmartJournalEntry() {
  const [, params] = useRoute("/organizations/:id/smart-journal-entry");
  const orgId = params?.id ? parseInt(params.id) : 0;

  // Smart Mode State
  const [description, setDescription] = useState("");
  const [proposedEntry, setProposedEntry] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Mode State
  const [manualLines, setManualLines] = useState<JournalLine[]>([
    { id: "1", accountCode: "", accountName: "", description: "", debit: 0, credit: 0 },
  ]);
  const [manualDescription, setManualDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: إضافة APIs للحسابات والذكاء الاصطناعي
  const accounts: any[] = [];

  const generateEntry = {
    mutate: (data: any) => {
      setIsGenerating(false);
      toast.error("هذه الميزة قيد التطوير");
    },
    isLoading: false,
  };
  
  if (false) {
    const onSuccess = (data: any) => {
      setProposedEntry(data);
      setIsGenerating(false);
      toast.success("تم إنشاء القيد المحاسبي بنجاح");
    };
    const onError = (error: any) => {
      setIsGenerating(false);
      toast.error(error.message || "فشل في إنشاء القيد المحاسبي");
    };
  }

  const handleGenerate = () => {
    if (!description.trim()) {
      toast.error("الرجاء إدخال وصف العملية");
      return;
    }

    setIsGenerating(true);
    generateEntry.mutate({
      organizationId: orgId,
      description: description.trim(),
    });
  };

  const handleSave = () => {
    if (!proposedEntry) return;

    if (!proposedEntry.isBalanced) {
      toast.error("القيد غير متوازن! يجب أن يكون المدين = الدائن");
      return;
    }

    // TODO: حفظ القيد في قاعدة البيانات
    toast.success("تم حفظ القيد المحاسبي بنجاح");
    
    // إعادة تعيين النموذج
    setDescription("");
    setProposedEntry(null);
  };

  const handleReset = () => {
    setDescription("");
    setProposedEntry(null);
  };

  // Manual Mode Functions
  const addLine = () => {
    const newId = (Math.max(...manualLines.map(l => parseInt(l.id))) + 1).toString();
    setManualLines([
      ...manualLines,
      { id: newId, accountCode: "", accountName: "", description: "", debit: 0, credit: 0 },
    ]);
  };

  const removeLine = (id: string) => {
    if (manualLines.length <= 1) {
      toast.error("يجب أن يحتوي القيد على سطر واحد على الأقل");
      return;
    }
    setManualLines(manualLines.filter(line => line.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalLine, value: any) => {
    setManualLines(manualLines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const selectAccount = (lineId: string, accountCode: string) => {
    const account = accounts?.find((a: any) => a.accountCode === accountCode);
    if (account) {
      updateLine(lineId, "accountCode", account.accountCode);
      updateLine(lineId, "accountName", account.accountName);
    }
  };

  const calculateTotals = () => {
    const totalDebit = manualLines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = manualLines.reduce((sum, line) => sum + (line.credit || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;
    return { totalDebit, totalCredit, isBalanced };
  };

  const handleManualSave = () => {
    const { isBalanced } = calculateTotals();
    
    if (!isBalanced) {
      toast.error("القيد غير متوازن! يجب أن يكون المدين = الدائن");
      return;
    }

    if (!manualDescription.trim()) {
      toast.error("الرجاء إدخال وصف القيد");
      return;
    }

    // TODO: حفظ القيد في قاعدة البيانات
    toast.success("تم حفظ القيد المحاسبي بنجاح");
    
    // إعادة تعيين
    setManualLines([
      { id: "1", accountCode: "", accountName: "", description: "", debit: 0, credit: 0 },
    ]);
    setManualDescription("");
  };

  const { totalDebit, totalCredit, isBalanced } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">القيد المحاسبي</h1>
              <p className="text-gray-600">إنشاء القيود المحاسبية بالذكاء الاصطناعي أو يدوياً</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="smart" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="smart" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              الوضع الذكي
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              الوضع اليدوي
            </TabsTrigger>
          </TabsList>

          {/* Smart Mode */}
          <TabsContent value="smart" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-lg font-semibold">
                    وصف العملية المحاسبية
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    اكتب وصف العملية بالعربية (مثال: شراء بضاعة بمبلغ 10000 ريال نقداً)
                  </p>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثال: شراء بضاعة بمبلغ 10000 ريال نقداً من المورد أحمد..."
                    rows={4}
                    className="text-lg"
                    disabled={isGenerating}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !description.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 ml-2" />
                        إنشاء القيد تلقائياً
                      </>
                    )}
                  </Button>

                  {proposedEntry && (
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                    >
                      <X className="w-5 h-5 ml-2" />
                      إعادة تعيين
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Proposed Entry Display */}
            {proposedEntry && (
              <Card className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">القيد المحاسبي المقترح</h2>
                      <p className="text-gray-600 mt-1">{proposedEntry.description}</p>
                    </div>
                    <div>
                      {proposedEntry.isBalanced ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <Check className="w-4 h-4 ml-1" />
                          متوازن
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="w-4 h-4 ml-1" />
                          غير متوازن
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Journal Entry Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-3 text-right font-semibold">رمز الحساب</th>
                          <th className="border p-3 text-right font-semibold">اسم الحساب</th>
                          <th className="border p-3 text-right font-semibold">البيان</th>
                          <th className="border p-3 text-right font-semibold text-green-700">مدين</th>
                          <th className="border p-3 text-right font-semibold text-red-700">دائن</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposedEntry.lines.map((line: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border p-3 font-mono">{line.accountCode}</td>
                            <td className="border p-3 font-semibold">{line.accountName}</td>
                            <td className="border p-3 text-gray-600">{line.description}</td>
                            <td className="border p-3 text-green-700 font-bold text-left">
                              {line.debit > 0 ? line.debit.toFixed(2) : "-"}
                            </td>
                            <td className="border p-3 text-red-700 font-bold text-left">
                              {line.credit > 0 ? line.credit.toFixed(2) : "-"}
                            </td>
                          </tr>
                        ))}
                        {/* Totals Row */}
                        <tr className="bg-gray-100 font-bold">
                          <td colSpan={3} className="border p-3 text-right">
                            الإجمالي
                          </td>
                          <td className="border p-3 text-green-700 text-left">
                            {proposedEntry.totalDebit.toFixed(2)}
                          </td>
                          <td className="border p-3 text-red-700 text-left">
                            {proposedEntry.totalCredit.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Suggestions */}
                  {proposedEntry.suggestions && proposedEntry.suggestions.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-yellow-900 mb-2">اقتراحات</h3>
                          <ul className="list-disc list-inside space-y-1 text-yellow-800">
                            {proposedEntry.suggestions.map((suggestion: string, index: number) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                    >
                      <X className="w-5 h-5 ml-2" />
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!proposedEntry.isBalanced}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      size="lg"
                    >
                      <Check className="w-5 h-5 ml-2" />
                      حفظ القيد
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Manual Mode */}
          <TabsContent value="manual" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <Label htmlFor="manual-description" className="text-lg font-semibold">
                    وصف القيد
                  </Label>
                  <Input
                    id="manual-description"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="مثال: شراء بضاعة نقداً"
                    className="mt-2"
                  />
                </div>

                {/* Journal Lines */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-semibold">أسطر القيد</Label>
                    <Button onClick={addLine} size="sm" variant="outline">
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة سطر
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {manualLines.map((line, index) => (
                      <Card key={line.id} className="p-4">
                        <div className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-1 flex items-center justify-center pt-2">
                            <span className="text-sm font-semibold text-gray-500">
                              {index + 1}
                            </span>
                          </div>

                          <div className="col-span-3">
                            <Label className="text-xs">الحساب</Label>
                            <Select
                              value={line.accountCode}
                              onValueChange={(value) => selectAccount(line.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر حساب" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts?.map((account: any) => (
                                  <SelectItem key={account.id} value={account.accountCode}>
                                    {account.accountCode} - {account.accountName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-3">
                            <Label className="text-xs">البيان</Label>
                            <Input
                              value={line.description}
                              onChange={(e) => updateLine(line.id, "description", e.target.value)}
                              placeholder="وصف السطر"
                            />
                          </div>

                          <div className="col-span-2">
                            <Label className="text-xs text-green-700">مدين</Label>
                            <Input
                              type="number"
                              value={line.debit || ""}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updateLine(line.id, "debit", value);
                                if (value > 0) updateLine(line.id, "credit", 0);
                              }}
                              placeholder="0.00"
                              className="text-green-700 font-semibold"
                            />
                          </div>

                          <div className="col-span-2">
                            <Label className="text-xs text-red-700">دائن</Label>
                            <Input
                              type="number"
                              value={line.credit || ""}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updateLine(line.id, "credit", value);
                                if (value > 0) updateLine(line.id, "debit", 0);
                              }}
                              placeholder="0.00"
                              className="text-red-700 font-semibold"
                            />
                          </div>

                          <div className="col-span-1 flex items-center justify-center pt-6">
                            <Button
                              onClick={() => removeLine(line.id)}
                              variant="ghost"
                              size="sm"
                              disabled={manualLines.length <= 1}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <Card className="p-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">إجمالي المدين</p>
                      <p className="text-2xl font-bold text-green-700">
                        {totalDebit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">إجمالي الدائن</p>
                      <p className="text-2xl font-bold text-red-700">
                        {totalCredit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">الحالة</p>
                      {isBalanced ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <Check className="w-4 h-4 ml-1" />
                          متوازن
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="w-4 h-4 ml-1" />
                          غير متوازن
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    onClick={() => {
                      setManualLines([
                        { id: "1", accountCode: "", accountName: "", description: "", debit: 0, credit: 0 },
                      ]);
                      setManualDescription("");
                    }}
                    variant="outline"
                    size="lg"
                  >
                    <X className="w-5 h-5 ml-2" />
                    إعادة تعيين
                  </Button>
                  <Button
                    onClick={handleManualSave}
                    disabled={!isBalanced}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    size="lg"
                  >
                    <Check className="w-5 h-5 ml-2" />
                    حفظ القيد
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
