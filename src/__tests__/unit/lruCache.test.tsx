// LruCache.test.ts
import { describe, it, expect } from "vitest";
import { LruCache } from "../../core/dataStruct/Cache";

describe("LruCache", () => {
  it("对于不存在的键应返回 undefined", () => {
    const cache = new LruCache<string, number>(3);
    expect(cache.get("key1")).toBeUndefined();
  });

  it("应将键值对添加到缓存中", () => {
    const cache = new LruCache<string, number>(3);
    cache.set("key1", 1);
    cache.set("key2", 2);
    cache.set("key3", 3);
    expect(cache.get("key1")).toBe(1);
    expect(cache.get("key2")).toBe(2);
    expect(cache.get("key3")).toBe(3);
  });

  it("当容量超出时，应添加键值对并移除最近最少使用的项目", () => {
    const cache = new LruCache<string, number>(3);
    cache.set("key1", 1);
    cache.set("key2", 2);
    cache.set("key3", 3);
    // 现在缓存已满
    cache.get("key1"); // 访问 'key1' 使其成为最近使用的
    cache.set("key4", 4); // 添加 'key4'，此时 'key2' 是最久未使用的
    expect(cache.get("key1")).toBe(1);
    expect(cache.get("key2")).toBeUndefined();
    expect(cache.get("key3")).toBe(3);
    expect(cache.get("key4")).toBe(4);
  });

  it("访问键时应更新其位置", () => {
    const cache = new LruCache<string, number>(3);
    cache.set("key1", 1);
    cache.set("key2", 2);
    cache.set("key3", 3);
    // 现在缓存已满
    cache.get("key1"); // 访问 'key1' 使其成为最近使用的
    cache.get("key2"); // 访问 'key2' 使其成为最近使用的
    cache.set("key4", 4); // 添加 'key4'，此时 'key3' 是最久未使用的
    expect(cache.get("key3")).toBeUndefined();
    expect(cache.get("key1")).toBe(1);
    expect(cache.get("key2")).toBe(2);
    expect(cache.get("key4")).toBe(4);
  });

  it("应正确报告键是否存在于缓存中", () => {
    const cache = new LruCache<string, number>(3);
    cache.set("key1", 1);
    cache.set("key2", 2);
    expect(cache.has("key1")).toBe(true);
    expect(cache.has("key3")).toBe(false);
  });

  it("应清除缓存", () => {
    const cache = new LruCache<string, number>(3);
    cache.set("key1", 1);
    cache.set("key2", 2);
    cache.set("key3", 3);
    cache.clear();
    expect(cache.get("key1")).toBeUndefined();
    expect(cache.get("key2")).toBeUndefined();
    expect(cache.get("key3")).toBeUndefined();
    expect(cache.size()).toBe(0);
  });

  it("应正确处理零容量的情况", () => {
    // 应该报错，容量不能为负数或者零
    expect(() => {
      new LruCache<string, number>(0);
    }).toThrow();
  });
});
