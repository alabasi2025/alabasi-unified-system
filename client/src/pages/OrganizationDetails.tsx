import { useRoute, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Hash,
  ArrowRight,
  Home,
  ChevronRight,
  Store,
  FolderTree,
  Wallet,
} from "lucide-react";

export default function OrganizationDetails() {
  const [, params] = useRoute("/organizations/:id");
  const [, navigate] = useLocation();
  const orgId = params?.id ? parseInt(params.id) : 0;

  const { data: organization, isLoading: orgLoading } = trpc.organizations.getById.useQuery(
    orgId,
    { enabled: orgId > 0 }
  );

  const { data: unit, isLoading: unitLoading } = trpc.units.getById.useQuery(
    organization?.unitId || 0,
    { enabled: !!organization?.unitId }
  );
  
  // TODO: إضافة API للفروع حسب المؤسسة
  const branches: any[] = [];
  const branchesLoading = false;

  const orgsLoading = orgLoading || unitLoading;

  if (orgsLoading || branchesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">المؤسسة غير موجودة</h2>
          <p className="text-muted-foreground mb-4">
            لم يتم العثور على المؤسسة المطلوبة
          </p>
          <Link href="/units">
            <Button>العودة للوحدات</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              الرئيسية
            </Button>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/units">
            <Button variant="ghost" size="sm">
              الوحدات
            </Button>
          </Link>
          {unit && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/units/${unit.id}`}>
                <Button variant="ghost" size="sm">
                  {unit.name}
                </Button>
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="font-semibold text-foreground">{organization.name}</span>
        </div>

        {/* Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border-2">
          <div className="flex items-start gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{organization.name}</h1>
                {organization.isActive && (
                  <Badge className="bg-green-500">نشطة</Badge>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  <span className="font-semibold">الرمز:</span>
                  <code className="px-2 py-1 bg-white dark:bg-slate-700 rounded">
                    {organization.code}
                  </code>
                </div>
                {organization.taxNumber && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span className="font-semibold">الرقم الضريبي:</span>
                    <span>{organization.taxNumber}</span>
                  </div>
                )}
                {organization.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold">العنوان:</span>
                    <span>{organization.address}</span>
                  </div>
                )}
                {organization.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-semibold">الهاتف:</span>
                    <span dir="ltr">{organization.phone}</span>
                  </div>
                )}
                {organization.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-semibold">البريد:</span>
                    <span dir="ltr">{organization.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href={`/organizations/${orgId}/chart-of-accounts`}>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                    <FolderTree className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">دليل الحسابات</h3>
                    <p className="text-sm text-muted-foreground">
                      عرض وإدارة دليل الحسابات
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
              </div>
            </Card>
          </Link>
          <Link href={`/organizations/${orgId}/analytical-accounts`}>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-purple-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">الحسابات التحليلية</h3>
                    <p className="text-sm text-muted-foreground">
                      إدارة الصناديق، البنوك، العملاء، الموردين وغيرها
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
              </div>
            </Card>
          </Link>
          <Link href={`/organizations/${orgId}/smart-journal-entry`}>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-indigo-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">القيد المحاسبي الذكي</h3>
                    <p className="text-sm text-muted-foreground">
                      إنشاء القيود المحاسبية بالذكاء الاصطناعي
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-indigo-600 group-hover:translate-x-2 transition-all" />
              </div>
            </Card>
          </Link>
          <Link href={`/organizations/${orgId}/smart-payment-voucher`}>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-red-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">سند الصرف الذكي</h3>
                    <p className="text-sm text-muted-foreground">
                      إنشاء سندات الصرف بالذكاء الاصطناعي
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-red-600 group-hover:translate-x-2 transition-all" />
              </div>
            </Card>
          </Link>
          <Link href={`/organizations/${orgId}/smart-receipt-voucher`}>
            <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-green-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">سند القبض الذكي</h3>
                    <p className="text-sm text-muted-foreground">
                      إنشاء سندات القبض بالذكاء الاصطناعي
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-green-600 group-hover:translate-x-2 transition-all" />
              </div>
            </Card>
          </Link>
          <Card className="p-6 opacity-50">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">التقارير المالية</h3>
                <p className="text-sm text-muted-foreground">
                  قريباً...
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {branches?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">الفروع</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">0</div>
            <div className="text-sm text-muted-foreground">الحسابات</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
            <div className="text-sm text-muted-foreground">القيود المحاسبية</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
            <div className="text-4xl font-bold text-orange-600 mb-2">0</div>
            <div className="text-sm text-muted-foreground">المعاملات</div>
          </Card>
        </div>

        {/* Branches Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">الفروع التابعة</h2>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {branches?.length || 0} فرع
            </Badge>
          </div>

          {!branches || branches.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Store className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">لا توجد فروع</h3>
              <p className="text-muted-foreground">
                لم يتم إضافة فروع لهذه المؤسسة بعد
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch: any) => (
                <Card
                  key={branch.id}
                  className="p-6 hover:shadow-xl transition-all group border-2 border-transparent hover:border-purple-500 cursor-pointer"
                  onClick={() => navigate(`/branches/${branch.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl group-hover:scale-110 transition-transform">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                        {branch.name}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3" />
                          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                            {branch.code}
                          </code>
                        </div>
                        {branch.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{branch.address}</span>
                          </div>
                        )}
                        {branch.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs" dir="ltr">
                              {branch.phone}
                            </span>
                          </div>
                        )}
                        {branch.managerName && (
                          <div className="text-xs mt-2">
                            <span className="font-semibold">المدير:</span>{" "}
                            {branch.managerName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
