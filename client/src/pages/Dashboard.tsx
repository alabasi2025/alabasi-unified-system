import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Brain,
  Target,
  ArrowRight,
  Building2,
  Wallet,
  BookOpen,
  Zap,
  Calculator,
  BarChart3,
  FileSpreadsheet,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth({ redirectOnUnauthenticated: false });
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const financialStats = {
    totalCash: stats?.totalCash || 0,
    totalRevenue: stats?.totalRevenue || 0,
    totalExpenses: stats?.totalExpenses || 0,
    cashChange: 12.5,
    revenueChange: 8.3,
    expensesChange: -5.2,
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header with Icon and Welcome */}
      <div className="text-center space-y-4 pt-8">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-purple-600">مرحباً متنوعات</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          نظام محاسبي ذكي يساعدك في بناء دليل الحسابات وإدارة القيود المحاسبية بسهولة
        </p>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السيولة</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialStats.totalCash.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{financialStats.cashChange}% من الشهر الماضي</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialStats.totalRevenue.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+{financialStats.revenueChange}% من الشهر الماضي</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialStats.totalExpenses.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{financialStats.expensesChange}% من الشهر الماضي</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* المساعد المحاسبي الذكي */}
      <Card 
        className="cursor-pointer hover:shadow-xl transition-all border-purple-200"
        onClick={() => setLocation("/ai-assistant")}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">المساعد المحاسبي الذكي</h3>
                <p className="text-muted-foreground">ابدأ محادثة مع المساعد الذكي لبناء نظامك المحاسبي</p>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* لوحة التحكم */}
      <Card 
        className="cursor-pointer hover:shadow-xl transition-all border-green-200"
        onClick={() => setLocation("/dashboard")}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">لوحة التحكم</h3>
                <p className="text-muted-foreground">نظرة عامة على النظام والإحصائيات</p>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* مركز التحكم الذكي - Large Card */}
      <Card 
        className="relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 border-0"
        onClick={() => setLocation("/dashboard")}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-90" />
        <CardContent className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Target className="h-12 w-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">مركز التحكم الذكي</h2>
                <p className="text-white/90 text-lg">
                  مساعدك الذكي لإنشاء وإدارة جميع مكونات نظامك المحاسبي
                </p>
              </div>
            </div>
            <ArrowRight className="h-8 w-8 text-white" />
          </div>
        </CardContent>
      </Card>

      {/* الوحدات المحاسبية */}
      <Card 
        className="cursor-pointer hover:shadow-xl transition-all border-pink-200"
        onClick={() => setLocation("/units")}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">الوحدات المحاسبية</h3>
                <p className="text-muted-foreground">إدارة الوحدات والمؤسسات والفروع المحاسبية</p>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Three Management Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setLocation("/units")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">إدارة الوحدات</CardTitle>
                <CardDescription className="mt-1">واجهة بسيطة لإدارة وتفعيل الوحدات المحاسبية</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setLocation("/organizations")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-xl">
                <Building2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg">إدارة المؤسسات</CardTitle>
                <CardDescription className="mt-1">واجهة بسيطة لإدارة وتفعيل المؤسسات والفروع</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setLocation("/analytical-accounts")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-lg">إدارة الحسابات</CardTitle>
                <CardDescription className="mt-1">إدارة وإنشاء ورؤية الصناديق والبنوك والأصول</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Three Tool Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setLocation("/chart-of-accounts")}
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-3 bg-orange-50 rounded-xl">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">بناء دليل الحسابات</CardTitle>
                <CardDescription>
                  أخبر المساعد عن نوع نشاطك وسيبني لك دليل حسابات كامل
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setLocation("/ai-assistant")}
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-3 bg-yellow-50 rounded-xl">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">القيود التلقائية</CardTitle>
                <CardDescription>
                  اكتب الجملة باللغة الطبيعية ليتم إنشاء القيد تلقائياً
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setLocation("/transactions")}
        >
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">المعاملات الذكية</CardTitle>
                <CardDescription>
                  إدارة التحويلات بين الحسابات والمؤسسات بسهولة
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
