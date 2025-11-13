import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";

export default function Assets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-purple-600" />
            إدارة الأصول
          </h1>
          <p className="text-muted-foreground mt-1">إدارة الأصول الثابتة والاستهلاك</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة أصل
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الأصول</CardTitle>
          <CardDescription>جميع الأصول الثابتة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            لا توجد أصول مسجلة حالياً. قم بإضافة أصل جديد للبدء.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
