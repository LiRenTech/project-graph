/**
 * 最近最少使用缓存
 * 原理：当缓存满时，删除最早添加的缓存
 */
export class LruCache<K, V> extends Map<K, V> {
  private readonly capacity: number;

  constructor(capacity: number) {
    super();
    if (capacity <= 0) {
      throw new Error("capacity must be greater than 0");
    }
    this.capacity = capacity;
  }

  set(key: K, value: V): this {
    if (super.has(key)) {
      super.delete(key);
    } else if (super.size >= this.capacity) {
      const firstKey = super.keys().next().value;
      if (firstKey !== undefined) {
        super.delete(firstKey);
      }
    }
    super.set(key, value);
    return this;
  }

  // 重写 get：访问后把该 key 提到“最近使用”位置
  get(key: K): V | undefined {
    const value = super.get(key);
    if (value !== undefined) {
      super.delete(key);
      super.set(key, value);
    }
    return value;
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
