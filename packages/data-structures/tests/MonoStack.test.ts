import { describe, expect, it } from "vitest";
import { MonoStack } from "../src/MonoStack";

describe("MonoStack 单调栈", () => {
  it("入栈 - 维护单调递增", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 1);
    stack.push("b", 2);
    expect(stack.length).toBe(2);
    expect(stack.peek()).toBe("b");

    // 'c'的level比'b'小，所以'b'会出栈
    stack.push("c", 1);
    expect(stack.length).toBe(1);
    expect(stack.peek()).toBe("c");
    expect(stack.get(0)).toBe("c");

    // 'd'的level等于'c'，所以'c'会出栈
    stack.push("d", 1);
    expect(stack.length).toBe(1);
    expect(stack.peek()).toBe("d");

    // 'e'的level更高，直接入栈
    stack.push("e", 5);
    expect(stack.length).toBe(2);
    expect(stack.peek()).toBe("e");
  });

  it("出栈", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 1);
    stack.push("b", 2);
    expect(stack.pop()).toBe("b");
    expect(stack.pop()).toBe("a");
    expect(stack.pop()).toBeUndefined();
  });

  it("查看栈顶", () => {
    const stack = new MonoStack<number>();
    expect(stack.peek()).toBeUndefined();
    stack.push(10, 1);
    expect(stack.peek()).toBe(10);
    stack.push(20, 2);
    expect(stack.peek()).toBe(20);
    expect(stack.length).toBe(2);
  });

  it("不安全的查看栈顶", () => {
    const stack = new MonoStack<number>();
    stack.push(10, 1);
    expect(stack.unsafePeek()).toBe(10);
    expect(() => {
      const emptyStack = new MonoStack();
      emptyStack.unsafePeek();
    }).toThrow();
  });

  it("通过索引获取元素", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 1);
    stack.push("b", 2);
    expect(stack.get(0)).toBe("a");
    expect(stack.get(1)).toBe("b");
    expect(stack.get(2)).toBeUndefined();
  });

  it("不安全地通过索引获取元素", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 1);
    expect(stack.unsafeGet(0)).toBe("a");
    expect(() => {
      const emptyStack = new MonoStack();
      emptyStack.unsafeGet(0);
    }).toThrow();
  });

  it("检查是否为空和长度", () => {
    const stack = new MonoStack<number>();
    expect(stack.isEmpty()).toBe(true);
    expect(stack.length).toBe(0);
    stack.push(1, 1);
    expect(stack.isEmpty()).toBe(false);
    expect(stack.length).toBe(1);
  });
});
