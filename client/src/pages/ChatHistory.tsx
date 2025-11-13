import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  MessageSquare, 
  Plus, 
  Search, 
  Clock, 
  Archive,
  Trash2,
  ArrowRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

export default function ChatHistory() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: إضافة APIs للجلسات
  const sessions: any[] = [];
  const isLoading = false;
  const refetch = () => {};

  const createSession = {
    mutate: (data: any) => {
      toast.error("هذه الميزة قيد التطوير");
    },
    isPending: false,
  };

  const handleNewChat = () => {
    createSession.mutate({
      title: "محادثة جديدة",
    });
  };

  const filteredSessions = sessions?.filter((session: any) => 
    session.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">نشطة</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">مكتملة</Badge>;
      case "archived":
        return <Badge className="bg-gray-500">مؤرشفة</Badge>;
      default:
        return null;
    }
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
                سجل المحادثات
              </h1>
              <p className="text-muted-foreground">
                جميع محادثاتك مع المساعد الذكي المحاسبي
              </p>
            </div>
            <Button
              onClick={handleNewChat}
              disabled={createSession.isPending}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {createSession.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
              ) : (
                <Plus className="w-5 h-5 ml-2" />
              )}
              محادثة جديدة
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المحادثات..."
              className="pr-10 text-base"
            />
          </div>
        </div>

        {/* Sessions Grid */}
        {!filteredSessions || filteredSessions.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                <MessageSquare className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">لا توجد محادثات بعد</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "لم يتم العثور على نتائج للبحث" 
                : "ابدأ محادثة جديدة مع المساعد الذكي"}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleNewChat}
                disabled={createSession.isPending}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {createSession.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <Plus className="w-5 h-5 ml-2" />
                )}
                ابدأ الآن
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSessions.map((session: any) => (
              <Link key={session.id} href={`/ai?session=${session.id}`}>
                <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-blue-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                            {session.title || "محادثة بدون عنوان"}
                          </h3>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(new Date(session.updatedAt), {
                                addSuffix: true,
                                locale: ar,
                              })}
                            </span>
                          </div>
                          <span>•</span>
                          <span>
                            تم الإنشاء: {new Date(session.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Statistics */}
        {sessions && sessions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {sessions.length}
              </div>
              <div className="text-sm text-muted-foreground">إجمالي المحادثات</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {sessions.filter((s: any) => s.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">محادثات نشطة</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {sessions.filter((s: any) => s.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">محادثات مكتملة</div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
