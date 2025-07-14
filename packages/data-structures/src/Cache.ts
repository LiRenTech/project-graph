/**
 * 最近最少使用缓存
 * 原理：当缓存满时，删除最早添加的缓存
 */
export class LruCache<K, V> {
  private cache: Map<K, V> = new Map();
  private readonly capacity: number;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error("capacity must be greater than 0");
    }
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        // 检查 firstKey 是否为 undefined
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * 一旦缓存达到最大容量，则自动删除全部
 */
export class MaxSizeCache<K, V> {
  private cache: Map<K, V> = new Map();
  private readonly maxSize: number;

  /**
   * 获取当前缓存的容量状态
   * @returns
   */
  getCapacityStatus(): [number, number] {
    return [this.cache.size, this.maxSize];
  }
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      this.cache.clear();
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
