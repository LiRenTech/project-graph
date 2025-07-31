import { describe, expect, it } from "vitest";
import { Stack } from "../src/Stack";

describe("Stack 栈", () => {
  it("入栈", () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);
    expect(stack.size()).toBe(2);
  });

  it("出栈", () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
  });

  it("查看栈顶", () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);
    expect(stack.peek()).toBe(2);
    expect(stack.size()).toBe(2);
  });

  it("检查是否为空", () => {
    const stack = new Stack<number>();
    expect(stack.isEmpty()).toBe(true);
    stack.push(1);
    expect(stack.isEmpty()).toBe(false);
  });

  it("获取栈大小", () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);
    stack.push(3);
    expect(stack.size()).toBe(3);
  });

  it("从空栈中出栈", () => {
    const stack = new Stack<number>();
    expect(stack.pop()).toBeUndefined();
  });

  it("查看空栈栈顶", () => {
    const stack = new Stack<number>();
    expect(stack.peek()).toBeUndefined();
  });
});
