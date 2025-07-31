import { describe, expect, it } from "vitest";
import { LimitLengthQueue } from "../src/LimitLengthQueue";

describe("LimitLengthQueue 受限队列", () => {
  it("构造函数", () => {
    expect(() => new LimitLengthQueue<number>(0)).toThrow("限制长度必须是正整数");
    expect(() => new LimitLengthQueue<number>(-1)).toThrow("限制长度必须是正整数");
  });

  it("入队 - 不超过限制", () => {
    const queue = new LimitLengthQueue<number>(3);
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.size()).toBe(2);
    expect(queue.arrayList).toEqual([1, 2]);
  });

  it("入队 - 超过限制", () => {
    const queue = new LimitLengthQueue<number>(3);
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.arrayList).toEqual([1, 2, 3]);
    queue.enqueue(4); // 队首1出队，4入队
    expect(queue.size()).toBe(3);
    expect(queue.arrayList).toEqual([2, 3, 4]);
    queue.enqueue(5);
    expect(queue.arrayList).toEqual([3, 4, 5]);
  });

  it("获取多个队尾元素", () => {
    const queue = new LimitLengthQueue<number>(5);
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    queue.enqueue(4);

    expect(queue.multiGetTail(2)).toEqual([3, 4]);
    expect(queue.multiGetTail(3)).toEqual([2, 3, 4]);
    expect(queue.multiGetTail(4)).toEqual([1, 2, 3, 4]);
    // 请求的数量超过队列现有元素，返回所有元素
    expect(queue.multiGetTail(5)).toEqual([1, 2, 3, 4]);
  });

  it("在空队列上获取多个队尾元素", () => {
    const queue = new LimitLengthQueue<number>(5);
    expect(queue.multiGetTail(3)).toEqual([]);
  });
});
