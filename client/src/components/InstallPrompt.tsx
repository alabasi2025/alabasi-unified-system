import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('installpromptavailable', handler);

    return () => {
      window.removeEventListener('installpromptavailable', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[App] User accepted the install prompt');
    } else {
      console.log('[App] User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // حفظ في localStorage لعدم إظهار الرسالة مرة أخرى لفترة
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // التحقق من عدم إظهار الرسالة إذا تم رفضها مؤخرًا
  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // إذا تم رفض الرسالة منذ أقل من 7 أيام، لا تظهرها
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-5">
      <button
        onClick={handleDismiss}
        className="absolute top-2 left-2 p-1 rounded-full hover:bg-accent"
        aria-label="إغلاق"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3 mt-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
          <img src="/icon-96.png" alt="أيقونة التطبيق" className="w-full h-full" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            ثبّت التطبيق على جهازك
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            احصل على تجربة أفضل مع إمكانية الوصول السريع والعمل بدون إنترنت
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              <Download className="h-4 w-4 ml-2" />
              تثبيت
            </Button>
            <Button onClick={handleDismiss} variant="outline" size="sm">
              لاحقًا
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
