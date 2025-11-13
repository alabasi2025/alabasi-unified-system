import { useParams, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Building2, 
  ArrowRight, 
  Home,
  Store,
  TrendingUp,
  Users
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function UnitDetails() {
  const { id } = useParams();
  const unitId = parseInt(id || "0");

  const { data: unit, isLoading: unitLoading } = trpc.units.getById.useQuery(unitId);
  // TODO: إضافة APIs للمؤسسات والفروع حسب الوحدة
  const organizations: any[] = [];
  const branches: any[] = [];
  const orgsLoading = false;
  const branchesLoading = false;

  const isLoading = unitLoading || orgsLoading || branchesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">الوحدة غير موجودة</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على الوحدة المطلوبة</p>
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
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <Home className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/units">الوحدات</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{unit.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Unit Header */}
        <Card className="p-8 mb-8 border-2">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {unit.name}
                </h1>
                <div className="flex items-center gap-3">
                  <code className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                    {unit.code}
                  </code>
                  {unit.isActive && (
                    <Badge className="bg-green-500">نشطة</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {unit.description && (
            <p className="text-lg text-muted-foreground mb-6">
              {unit.description}
            </p>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {organizations?.length || 0}
                  </div>
                  <div className="text-sm text-blue-600/80">المؤسسات</div>
                </div>
                <Store className="w-10 h-10 text-blue-600/50" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {branches?.length || 0}
                  </div>
                  <div className="text-sm text-purple-600/80">الفروع</div>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-600/50" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {(branches?.length || 0) + (organizations?.length || 0)}
                  </div>
                  <div className="text-sm text-green-600/80">إجمالي الكيانات</div>
                </div>
                <Users className="w-10 h-10 text-green-600/50" />
              </div>
            </Card>
          </div>
        </Card>

        {/* Organizations List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">المؤسسات التابعة</h2>
          {!organizations || organizations.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد مؤسسات في هذه الوحدة</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {organizations.map((org: any) => {
                const orgBranches = branches?.filter((b: any) => b.organizationId === org.id) || [];
                return (
                  <Link key={org.id} href={`/organizations/${org.id}`}>
                    <Card
                      className="p-6 hover:shadow-xl transition-all group border-2 border-transparent hover:border-blue-500 cursor-pointer"
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                            <Store className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                              {org.name}
                            </h3>
                            <code className="text-xs text-muted-foreground">
                              {org.code}
                            </code>
                          </div>
                        </div>

                        {/* Branches */}
                        {orgBranches.length > 0 && (
                          <div className="mr-10">
                            <div className="text-sm font-semibold text-muted-foreground mb-2">
                              الفروع ({orgBranches.length}):
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {orgBranches.map((branch: any) => (
                                <Badge
                                  key={branch.id}
                                  variant="outline"
                                  className="text-sm"
                                >
                                  {branch.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                    </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
