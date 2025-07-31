import { describe, expect, it } from "vitest";
import { Queue } from "../src/Queue";

describe("Queue 队列", () => {
  it("入队", () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.size()).toBe(2);
  });

  it("出队", () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
  });

  it("查看队首", () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.peek()).toBe(1);
    expect(queue.size()).toBe(2);
  });

  it("查看队尾", () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.tail()).toBe(2);
    expect(queue.size()).toBe(2);
  });

  it("检查是否为空", () => {
    const queue = new Queue<number>();
    expect(queue.isEmpty()).toBe(true);
    queue.enqueue(1);
    expect(queue.isEmpty()).toBe(false);
  });

  it("获取队列大小", () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.size()).toBe(3);
    expect(queue.length).toBe(3);
  });

  it("从空队列中出队", () => {
    const queue = new Queue<number>();
    expect(queue.dequeue()).toBeUndefined();
  });

  it("查看空队列的队首", () => {
    const queue = new Queue<number>();
    expect(queue.peek()).toBeUndefined();
  });

  it("查看空队列的队尾", () => {
    const queue = new Queue<number>();
    expect(queue.tail()).toBeUndefined();
  });

  it("清空队列", () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.clear();
    expect(queue.isEmpty()).toBe(true);
    expect(queue.size()).toBe(0);
  });
});
