// تسجيل Service Worker للتطبيق

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[App] Service Worker registered successfully:', registration.scope);

      // التحقق من التحديثات
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // يوجد تحديث جديد
              console.log('[App] New Service Worker available');
              
              // يمكن إظهار رسالة للمستخدم لتحديث التطبيق
              if (confirm('يتوفر إصدار جديد من التطبيق. هل تريد التحديث الآن؟')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[App] Service Worker registration failed:', error);
      throw error;
    }
  } else {
    console.warn('[App] Service Workers are not supported in this browser');
    return null;
  }
}

// طلب إذن الإشعارات
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('[App] Notification permission:', permission);
    return permission === 'granted';
  }
  return false;
}

// الاشتراك في Push Notifications
export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // يمكن استبدال هذا بمفتاح VAPID الحقيقي
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib37gp65ImLE0_PTkR-TF1-ByqC9aV7hGCA3vVgXvYDqGkPJfJHrPJqGtFg'
      ),
    });

    console.log('[App] Push subscription:', subscription);
    
    // يمكن إرسال الاشتراك إلى الخادم هنا
    // await fetch('/api/push/subscribe', {
    //   method: 'POST',
    //   body: JSON.stringify(subscription),
    //   headers: { 'Content-Type': 'application/json' },
    // });

    return subscription;
  } catch (error) {
    console.error('[App] Push subscription failed:', error);
    throw error;
  }
}

// تحويل مفتاح VAPID من Base64 إلى Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// إظهار زر "إضافة إلى الشاشة الرئيسية"
export function setupInstallPrompt() {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // منع ظهور الرسالة التلقائية
    e.preventDefault();
    deferredPrompt = e;

    // يمكن إظهار زر مخصص للتثبيت
    console.log('[App] Install prompt available');
    
    // إطلاق حدث مخصص
    window.dispatchEvent(new CustomEvent('installpromptavailable', { detail: deferredPrompt }));
  });

  window.addEventListener('appinstalled', () => {
    console.log('[App] App installed successfully');
    deferredPrompt = null;
  });

  return {
    showInstallPrompt: async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[App] Install prompt outcome:', outcome);
        deferredPrompt = null;
        return outcome === 'accepted';
      }
      return false;
    },
  };
}
