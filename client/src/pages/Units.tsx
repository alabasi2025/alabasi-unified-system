import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Units() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const { data: units, isLoading, refetch } = trpc.units.list.useQuery();

  const createUnit = trpc.units.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الوحدة بنجاح");
      refetch();
      setOpen(false);
      setFormData({ name: "", code: "", description: "" });
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء إنشاء الوحدة");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error("الرجاء إدخال اسم الوحدة والرمز");
      return;
    }
    createUnit.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                الوحدات المحاسبية
              </h1>
              <p className="text-muted-foreground">
                إدارة الوحدات المحاسبية في النظام
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة وحدة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>إنشاء وحدة محاسبية جديدة</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات الوحدة المحاسبية الجديدة
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الوحدة *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="مثال: العباسي عام"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">رمز الوحدة *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="مثال: ABASI-01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="وصف مختصر للوحدة المحاسبية"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      disabled={createUnit.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {createUnit.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      ) : (
                        <Plus className="w-4 h-4 ml-2" />
                      )}
                      إنشاء الوحدة
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Units Grid */}
        {!units || units.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                <Building2 className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">لا توجد وحدات محاسبية بعد</h2>
            <p className="text-muted-foreground mb-6">
              ابدأ بإنشاء وحدة محاسبية جديدة
            </p>
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 ml-2" />
              إنشاء وحدة جديدة
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <Link key={unit.id} href={`/units/${unit.id}`}>
                <Card
                  className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-blue-500"
                >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  {unit.isActive && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      نشطة
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {unit.name}
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">الرمز:</span>
                    <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                      {unit.code}
                    </code>
                  </div>
                  {unit.description && (
                    <p className="mt-3 text-sm">{unit.description}</p>
                  )}
                  <div className="pt-3 border-t mt-3">
                    <span className="text-xs">
                      تم الإنشاء: {new Date(unit.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Statistics */}
        {units && units.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {units.length}
              </div>
              <div className="text-sm text-muted-foreground">إجمالي الوحدات</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {units.filter((u) => u.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">وحدات نشطة</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {units.filter((u) => !u.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">وحدات غير نشطة</div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
