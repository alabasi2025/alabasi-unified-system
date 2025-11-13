import { EventEmitter } from 'events';

/**
 * Event Interface
 * واجهة الحدث القياسية
 */
export interface IEvent {
  type: string;
  moduleId: string;
  payload: any;
  timestamp: Date;
  userId?: number;
}

/**
 * Event Handler
 */
export type EventHandler = (event: IEvent) => Promise<void> | void;

/**
 * Event Bus
 * ناقل الأحداث - يدير التواصل بين الوحدات
 */
export class EventBus extends EventEmitter {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventLog: IEvent[] = [];
  private maxLogSize: number = 1000;

  /**
   * نشر حدث
   */
  async publish(eventType: string, payload: any, moduleId: string, userId?: number): Promise<void> {
    const event: IEvent = {
      type: eventType,
      moduleId,
      payload,
      timestamp: new Date(),
      userId,
    };

    // حفظ في السجل
    this.logEvent(event);

    // إرسال إلى المستمعين
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const promises = Array.from(handlers).map(handler => 
        this.executeHandler(handler, event)
      );
      await Promise.allSettled(promises);
    }

    // إرسال عبر EventEmitter للمراقبة
    this.emit('event:published', event);
    console.log(`📢 Event published: ${eventType} from ${moduleId}`);
  }

  /**
   * الاشتراك في حدث
   */
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);
    console.log(`👂 Subscribed to event: ${eventType}`);

    // إرجاع دالة لإلغاء الاشتراك
    return () => this.unsubscribe(eventType, handler);
  }

  /**
   * إلغاء الاشتراك من حدث
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  /**
   * تنفيذ معالج الحدث
   */
  private async executeHandler(handler: EventHandler, event: IEvent): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      console.error(`❌ Error executing handler for ${event.type}:`, error);
      this.emit('handler:error', { event, error });
    }
  }

  /**
   * حفظ الحدث في السجل
   */
  private logEvent(event: IEvent): void {
    this.eventLog.push(event);
    
    // الحفاظ على حجم السجل
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
  }

  /**
   * الحصول على سجل الأحداث
   */
  getEventLog(filter?: { type?: string; moduleId?: string; limit?: number }): IEvent[] {
    let events = [...this.eventLog];

    if (filter?.type) {
      events = events.filter(e => e.type === filter.type);
    }

    if (filter?.moduleId) {
      events = events.filter(e => e.moduleId === filter.moduleId);
    }

    if (filter?.limit) {
      events = events.slice(-filter.limit);
    }

    return events;
  }

  /**
   * مسح سجل الأحداث
   */
  clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * الحصول على قائمة أنواع الأحداث المسجلة
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * الحصول على عدد المستمعين لحدث معين
   */
  getListenerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0;
  }
}

// Singleton Instance
export const eventBus = new EventBus();

// ============ أمثلة على الأحداث القياسية ============

/**
 * أحداث المستخدمين
 */
export const UserEvents = {
  CREATED: 'user.created',
  UPDATED: 'user.updated',
  DELETED: 'user.deleted',
  LOGIN: 'user.login',
  LOGOUT: 'user.logout',
} as const;

/**
 * أحداث الوحدات
 */
export const ModuleEvents = {
  INSTALLED: 'module.installed',
  UNINSTALLED: 'module.uninstalled',
  ENABLED: 'module.enabled',
  DISABLED: 'module.disabled',
} as const;

/**
 * أحداث النظام
 */
export const SystemEvents = {
  STARTUP: 'system.startup',
  SHUTDOWN: 'system.shutdown',
  ERROR: 'system.error',
  UPDATE_AVAILABLE: 'system.update_available',
} as const;
