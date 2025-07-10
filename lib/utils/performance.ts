// 效能監控工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // 開始計時
  startTiming(label: string): void {
    if (typeof performance !== 'undefined') {
      this.metrics.set(label, performance.now());
    }
  }

  // 結束計時並記錄
  endTiming(label: string): number {
    if (typeof performance !== 'undefined') {
      const startTime = this.metrics.get(label);
      if (startTime) {
        const duration = performance.now() - startTime;
        this.metrics.delete(label);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      }
    }
    return 0;
  }

  // 測量函數執行時間
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTiming(label);
    try {
      const result = await fn();
      this.endTiming(label);
      return result;
    } catch (error) {
      this.endTiming(label);
      throw error;
    }
  }

  // 測量同步函數執行時間
  measure<T>(label: string, fn: () => T): T {
    this.startTiming(label);
    try {
      const result = fn();
      this.endTiming(label);
      return result;
    } catch (error) {
      this.endTiming(label);
      throw error;
    }
  }

  // 記錄 Core Web Vitals
  recordWebVitals(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`📊 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        if (process.env.NODE_ENV === 'development') {
          console.log(`📊 CLS: ${clsValue.toFixed(4)}`);
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }
}

// 單例實例
export const performanceMonitor = PerformanceMonitor.getInstance();

// React Hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    startTiming: (label: string) => performanceMonitor.startTiming(label),
    endTiming: (label: string) => performanceMonitor.endTiming(label),
    measureAsync: <T>(label: string, fn: () => Promise<T>) => 
      performanceMonitor.measureAsync(label, fn),
    measure: <T>(label: string, fn: () => T) => 
      performanceMonitor.measure(label, fn)
  };
};