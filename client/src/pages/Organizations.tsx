import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";

export default function Organizations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            إدارة المؤسسات
          </h1>
          <p className="text-muted-foreground mt-1">إدارة المؤسسات والفروع</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة مؤسسة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المؤسسات</CardTitle>
          <CardDescription>جميع المؤسسات والفروع في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            لا توجد مؤسسات مسجلة حالياً. قم بإضافة مؤسسة جديدة للبدء.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
