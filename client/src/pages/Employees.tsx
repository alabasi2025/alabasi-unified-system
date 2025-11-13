import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

export default function Employees() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            إدارة الموظفين
          </h1>
          <p className="text-muted-foreground mt-1">إدارة بيانات الموظفين والرواتب</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة موظف
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين</CardTitle>
          <CardDescription>جميع الموظفين في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            لا توجد بيانات موظفين حالياً. قم بإضافة موظف جديد للبدء.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
