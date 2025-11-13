import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles, FileText, Receipt, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "مرحباً! أنا المساعد المحاسبي الذكي. يمكنني مساعدتك في:\n\n• إنشاء القيود اليومية تلقائياً\n• إنشاء سندات القبض والصرف\n• بناء دليل حسابات كامل\n• الإجابة على أسئلتك المحاسبية\n\nجرب أن تقول: \"سجل مصروف إيجار 10000 ريال من البنك\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickCommands = [
    { text: "سجل سند قبض 5000 ريال", icon: Receipt },
    { text: "سجل سند صرف 3000 ريال", icon: FileText },
    { text: "أنشئ قيد مبيعات 15000 ريال", icon: Calculator },
    { text: "ابني لي دليل حسابات لمحل تجاري", icon: Sparkles },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: استدعاء API الذكاء الاصطناعي
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "شكراً على رسالتك! المساعد الذكي قيد التطوير حالياً. سيتم تفعيل هذه الميزة قريباً لمساعدتك في إنشاء القيود والسندات تلقائياً.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickCommand = (command: string) => {
    setInput(command);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            المساعد المحاسبي الذكي
          </h1>
          <p className="text-muted-foreground mt-1">إنشاء القيود والسندات بالذكاء الاصطناعي</p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          <Sparkles className="h-3 w-3 ml-1" />
          مدعوم بالذكاء الاصطناعي
        </Badge>
      </div>

      {/* Quick Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أوامر سريعة</CardTitle>
          <CardDescription>جرب هذه الأوامر للبدء</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {quickCommands.map((cmd, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => handleQuickCommand(cmd.text)}
              >
                <cmd.icon className="h-4 w-4 ml-2 text-purple-600" />
                <span className="text-right">{cmd.text}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader>
          <CardTitle>المحادثة</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === "user" ? "text-purple-200" : "text-muted-foreground"
                  }`}>
                    {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="اكتب رسالتك هنا... مثل: سجل مصروف إيجار 10000 ريال"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              قيود تلقائية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              اكتب العملية بالعربية وسيتم إنشاء القيد المحاسبي تلقائياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              سندات ذكية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              إنشاء سندات القبض والصرف بأمر واحد فقط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              دليل حسابات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              بناء دليل حسابات كامل حسب نوع نشاطك التجاري
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
