import { useState } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Sparkles,
  Building2,
  Factory,
  Store,
  BookOpen,
  Wallet,
  FileText,
  TrendingDown,
  TrendingUp,
  Loader2,
  Send,
  Lightbulb,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Filter,
  Home,
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// تعريف أنواع البيانات
interface CommandHistoryItem {
  id: number;
  command: string;
  commandType: string;
  status: "success" | "failed" | "pending";
  result?: string;
  errorMessage?: string;
  executionTime?: number;
  createdAt: string;
}

interface CommandStats {
  total: number;
  successful: number;
  failed: number;
}

export default function AIHub() {
  const [, params] = useRoute("/ai-hub");
  
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في إنشاء وإدارة جميع مكونات نظامك المحاسبي. كيف يمكنني مساعدتك اليوم؟"
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("chat");
  const [commandFilter, setCommandFilter] = useState<string>("all");

  // TODO: سيتم تفعيل هذه APIs عندما تكون جاهزة
  const commandHistory: CommandHistoryItem[] = [];
  const commandStats: CommandStats = { total: 0, successful: 0, failed: 0 };
  const refetchHistory = () => {};

  const capabilities = [
    {
      icon: Building2,
      title: "إنشاء الوحدات",
      description: "إنشاء وحدات محاسبية جديدة",
      command: "أنشئ وحدة محاسبية جديدة باسم...",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Factory,
      title: "إنشاء المؤسسات",
      description: "إنشاء مؤسسات وفروع",
      command: "أنشئ مؤسسة جديدة باسم...",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Store,
      title: "إنشاء الفروع",
      description: "إضافة فروع للمؤسسات",
      command: "أنشئ فرع جديد باسم...",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: BookOpen,
      title: "بناء دليل الحسابات",
      description: "إنشاء حسابات رئيسية وفرعية",
      command: "أنشئ حساب رئيسي...",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Wallet,
      title: "القيود التلقائية",
      description: "إنشاء قيود يومية تلقائياً",
      command: "سجل قيد يومي...",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: FileText,
      title: "سندات القبض",
      description: "إنشاء سندات قبض",
      command: "أنشئ سند قبض...",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: TrendingDown,
      title: "سندات الصرف",
      description: "إنشاء سندات صرف",
      command: "أنشئ سند صرف...",
      color: "from-red-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "التقارير المالية",
      description: "إنشاء تقارير مالية",
      command: "أنشئ تقرير...",
      color: "from-indigo-500 to-indigo-600"
    },
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;

    const userMessage = message.trim();
    setMessage("");
    setIsProcessing(true);

    // إضافة رسالة المستخدم
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      // TODO: استدعاء API الذكاء الاصطناعي هنا
      // const result = await trpc.ai.processCommand.mutate({ command: userMessage });
      
      // محاكاة معالجة الأمر
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = `تم استلام أمرك: "${userMessage}"\n\nسيتم تنفيذ هذا الأمر عندما يتم تفعيل نظام الذكاء الاصطناعي بالكامل.`;
      
      setChatHistory(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: `عذراً، حدث خطأ أثناء معالجة طلبك: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapabilityClick = (command: string) => {
    setMessage(command);
    setSelectedTab("chat");
  };

  const getCommandTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      unit: "وحدة",
      organization: "مؤسسة",
      branch: "فرع",
      account: "حساب",
      journal: "قيد يومي",
      receipt: "سند قبض",
      payment: "سند صرف",
      report: "تقرير",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                الرئيسية
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>مركز التحكم الذكي</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            مركز التحكم الذكي
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            مساعدك الذكي لإنشاء وإدارة جميع مكونات نظامك المحاسبي بطريقة تلقائية وذكية
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="chat" className="text-lg">
              <Sparkles className="w-5 h-5 ml-2" />
              المحادثة
            </TabsTrigger>
            <TabsTrigger value="capabilities" className="text-lg">
              <Lightbulb className="w-5 h-5 ml-2" />
              القدرات
            </TabsTrigger>
            <TabsTrigger value="history" className="text-lg">
              <History className="w-5 h-5 ml-2" />
              السجل
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="p-6 max-w-4xl mx-auto">
              <div className="space-y-6">
                {/* Chat History */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-3">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="اكتب أمرك هنا... مثال: أنشئ وحدة محاسبية جديدة باسم 'الفرع الرئيسي'"
                    className="flex-1 min-h-[100px] text-lg resize-none"
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isProcessing}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Send className="w-6 h-6" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Capabilities Tab */}
          <TabsContent value="capabilities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {capabilities.map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <Card
                    key={index}
                    className="p-6 hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => handleCapabilityClick(capability.command)}
                  >
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${capability.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {capability.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {capability.description}
                    </p>
                    <p className="text-sm text-gray-500 italic">
                      "{capability.command}"
                    </p>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="p-6 max-w-6xl mx-auto">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {commandStats.total}
                  </div>
                  <div className="text-gray-600">إجمالي الأوامر</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-8 h-8" />
                    {commandStats.successful}
                  </div>
                  <div className="text-gray-600">نجحت</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                  <div className="text-4xl font-bold text-red-600 mb-2 flex items-center justify-center gap-2">
                    <XCircle className="w-8 h-8" />
                    {commandStats.failed}
                  </div>
                  <div className="text-gray-600">فشلت</div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-4 mb-6">
                <Filter className="w-5 h-5 text-gray-500" />
                <Select value={commandFilter} onValueChange={setCommandFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="تصفية حسب النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="unit">وحدات</SelectItem>
                    <SelectItem value="organization">مؤسسات</SelectItem>
                    <SelectItem value="branch">فروع</SelectItem>
                    <SelectItem value="account">حسابات</SelectItem>
                    <SelectItem value="journal">قيود يومية</SelectItem>
                    <SelectItem value="receipt">سندات قبض</SelectItem>
                    <SelectItem value="payment">سندات صرف</SelectItem>
                    <SelectItem value="report">تقارير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* History List */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <History className="w-6 h-6" />
                  سجل الأوامر
                </h2>
                
                <div className="space-y-3">
                  {commandHistory
                    .filter((cmd: CommandHistoryItem) => commandFilter === "all" || cmd.commandType === commandFilter)
                    .map((cmd: CommandHistoryItem) => (
                    <div
                      key={cmd.id}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={cmd.status === "success" ? "default" : cmd.status === "failed" ? "destructive" : "secondary"}
                              className={cmd.status === "success" ? "bg-green-600" : cmd.status === "pending" ? "bg-yellow-600" : ""}
                            >
                              {cmd.status === "success" ? "نجح" : cmd.status === "failed" ? "فشل" : "قيد المعالجة"}
                            </Badge>
                            <Badge variant="outline">
                              {getCommandTypeLabel(cmd.commandType)}
                            </Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(cmd.createdAt), "PPp", { locale: ar })}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium mb-2">{cmd.command}</p>
                          {cmd.result && (
                            <details className="text-sm text-gray-600">
                              <summary className="cursor-pointer hover:text-purple-600">عرض التفاصيل</summary>
                              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                                {cmd.result}
                              </pre>
                            </details>
                          )}
                          {cmd.errorMessage && (
                            <p className="text-sm text-red-600 mt-2">خطأ: {cmd.errorMessage}</p>
                          )}
                          {cmd.executionTime && (
                            <p className="text-xs text-gray-500 mt-1">وقت التنفيذ: {cmd.executionTime}ms</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => {
                            setMessage(cmd.command);
                            setSelectedTab("chat");
                          }}
                        >
                          <RotateCcw className="w-4 h-4 ml-2" />
                          إعادة التنفيذ
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {commandHistory.filter((cmd: CommandHistoryItem) => commandFilter === "all" || cmd.commandType === commandFilter).length === 0 && (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">لا توجد أوامر بعد</p>
                      <p className="text-gray-500 text-sm mt-2">ابدأ بإرسال أوامر من تبويب المحادثة</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
