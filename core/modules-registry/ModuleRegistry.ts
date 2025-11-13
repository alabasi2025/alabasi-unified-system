import { EventEmitter } from 'events';

/**
 * Module Interface
 * واجهة الوحدة القياسية
 */
export interface IModule {
  id: string;
  name: string;
  displayName: string;
  version: string;
  required: boolean;
  dependencies: string[];
  
  database: {
    name: string;
    tables: string[];
  };
  
  routes?: any[];
  events?: {
    subscribes?: string[];
    publishes?: string[];
  };
  
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
}

/**
 * Module Registry
 * سجل الوحدات - يدير جميع الوحدات في النظام
 */
export class ModuleRegistry extends EventEmitter {
  private modules: Map<string, IModule> = new Map();
  private installedModules: Set<string> = new Set();
  private enabledModules: Set<string> = new Set();

  /**
   * تسجيل وحدة جديدة
   */
  async register(module: IModule): Promise<void> {
    if (this.modules.has(module.id)) {
      throw new Error(`Module ${module.id} is already registered`);
    }

    // التحقق من التبعيات
    for (const dep of module.dependencies) {
      if (!this.modules.has(dep)) {
        throw new Error(`Dependency ${dep} not found for module ${module.id}`);
      }
    }

    this.modules.set(module.id, module);
    this.emit('module:registered', module);
    console.log(`✅ Module registered: ${module.id}`);
  }

  /**
   * تثبيت وحدة
   */
  async install(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (this.installedModules.has(moduleId)) {
      throw new Error(`Module ${moduleId} is already installed`);
    }

    // تثبيت التبعيات أولاً
    for (const dep of module.dependencies) {
      if (!this.installedModules.has(dep)) {
        await this.install(dep);
      }
    }

    // تنفيذ دالة التثبيت
    if (module.onInstall) {
      await module.onInstall();
    }

    this.installedModules.add(moduleId);
    this.emit('module:installed', module);
    console.log(`✅ Module installed: ${moduleId}`);
  }

  /**
   * إلغاء تثبيت وحدة
   */
  async uninstall(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (module.required) {
      throw new Error(`Cannot uninstall required module: ${moduleId}`);
    }

    if (!this.installedModules.has(moduleId)) {
      throw new Error(`Module ${moduleId} is not installed`);
    }

    // التحقق من عدم وجود وحدات تعتمد عليها
    for (const [id, mod] of this.modules) {
      if (mod.dependencies.includes(moduleId) && this.installedModules.has(id)) {
        throw new Error(`Cannot uninstall ${moduleId}: ${id} depends on it`);
      }
    }

    // تعطيل الوحدة أولاً
    if (this.enabledModules.has(moduleId)) {
      await this.disable(moduleId);
    }

    // تنفيذ دالة إلغاء التثبيت
    if (module.onUninstall) {
      await module.onUninstall();
    }

    this.installedModules.delete(moduleId);
    this.emit('module:uninstalled', module);
    console.log(`✅ Module uninstalled: ${moduleId}`);
  }

  /**
   * تفعيل وحدة
   */
  async enable(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (!this.installedModules.has(moduleId)) {
      throw new Error(`Module ${moduleId} is not installed`);
    }

    if (this.enabledModules.has(moduleId)) {
      throw new Error(`Module ${moduleId} is already enabled`);
    }

    // تفعيل التبعيات أولاً
    for (const dep of module.dependencies) {
      if (!this.enabledModules.has(dep)) {
        await this.enable(dep);
      }
    }

    // تنفيذ دالة التفعيل
    if (module.onEnable) {
      await module.onEnable();
    }

    this.enabledModules.add(moduleId);
    this.emit('module:enabled', module);
    console.log(`✅ Module enabled: ${moduleId}`);
  }

  /**
   * تعطيل وحدة
   */
  async disable(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (module.required) {
      throw new Error(`Cannot disable required module: ${moduleId}`);
    }

    if (!this.enabledModules.has(moduleId)) {
      throw new Error(`Module ${moduleId} is not enabled`);
    }

    // التحقق من عدم وجود وحدات مفعلة تعتمد عليها
    for (const [id, mod] of this.modules) {
      if (mod.dependencies.includes(moduleId) && this.enabledModules.has(id)) {
        throw new Error(`Cannot disable ${moduleId}: ${id} depends on it`);
      }
    }

    // تنفيذ دالة التعطيل
    if (module.onDisable) {
      await module.onDisable();
    }

    this.enabledModules.delete(moduleId);
    this.emit('module:disabled', module);
    console.log(`✅ Module disabled: ${moduleId}`);
  }

  /**
   * الحصول على وحدة
   */
  getModule(moduleId: string): IModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * الحصول على جميع الوحدات
   */
  getAllModules(): IModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * الحصول على الوحدات المثبتة
   */
  getInstalledModules(): IModule[] {
    return Array.from(this.installedModules)
      .map(id => this.modules.get(id))
      .filter(Boolean) as IModule[];
  }

  /**
   * الحصول على الوحدات المفعلة
   */
  getEnabledModules(): IModule[] {
    return Array.from(this.enabledModules)
      .map(id => this.modules.get(id))
      .filter(Boolean) as IModule[];
  }

  /**
   * التحقق من تثبيت وحدة
   */
  isInstalled(moduleId: string): boolean {
    return this.installedModules.has(moduleId);
  }

  /**
   * التحقق من تفعيل وحدة
   */
  isEnabled(moduleId: string): boolean {
    return this.enabledModules.has(moduleId);
  }
}

// Singleton Instance
export const moduleRegistry = new ModuleRegistry();
