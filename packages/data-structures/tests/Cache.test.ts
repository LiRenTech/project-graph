import { describe, expect, it } from "vitest";
import { LruCache, MaxSizeCache } from "../src/Cache";

describe("LruCache 缓存", () => {
  it("基本 set 和 get", () => {
    const cache = new LruCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBe(2);
  });

  it("get 操作会更新项目为最近使用", () => {
    const cache = new LruCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.get("a"); // a 变为最近使用的
    cache.set("c", 3); // b 应该被淘汰
    expect(cache.has("b")).toBe(false);
    expect(cache.has("a")).toBe(true);
    expect(cache.has("c")).toBe(true);
  });

  it("set 操作会更新项目为最近使用", () => {
    const cache = new LruCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("a", 11); // a 变为最近使用的
    cache.set("c", 3); // b 应该被淘汰
    expect(cache.has("b")).toBe(false);
    expect(cache.get("a")).toBe(11);
    expect(cache.has("c")).toBe(true);
  });

  it("容量为0时，无法添加", () => {
    const cache = new LruCache<string, number>(0);
    cache.set("a", 1);
    expect(cache.has("a")).toBe(false);
  });

  it("超出容量时，淘汰最久未使用的", () => {
    const cache = new LruCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3); // a 应该被淘汰
    expect(cache.has("a")).toBe(false);
    expect(cache.get("b")).toBe(2);
    expect(cache.get("c")).toBe(3);
  });
});

describe("MaxSizeCache 最大容量缓存", () => {
  it("达到最大容量时自动清空", () => {
    const cache = new MaxSizeCache<string, number>(3);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    expect(cache.getCapacityStatus()).toEqual([3, 3]);
    cache.set("d", 4); // 缓存已满，再次添加将清空
    expect(cache.getCapacityStatus()).toEqual([1, 3]);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("d")).toBe(4);
  });

  it("get, has, clear 方法", () => {
    const cache = new MaxSizeCache<string, number>(2);
    cache.set("a", 1);
    expect(cache.get("a")).toBe(1);
    expect(cache.has("a")).toBe(true);
    expect(cache.has("b")).toBe(false);
    cache.clear();
    expect(cache.has("a")).toBe(false);
    expect(cache.getCapacityStatus()).toEqual([0, 2]);
  });
});
