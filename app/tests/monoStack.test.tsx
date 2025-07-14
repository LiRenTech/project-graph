import { describe, expect, it } from "vitest";
import { MonoStack } from "../src/core/dataStruct/MonoStack";
describe("monoStack", () => {
  /**
   * a
   *  b
   *   c
   */
  it("正常", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 0);
    expect(stack.peek()).toBe("a");
    stack.push("b", 1);
    expect(stack.peek()).toBe("b");
    stack.push("c", 2);
    expect(stack.peek()).toBe("c");
  });
  /**
   * a
   *  b
   * c
   */
  it("压栈时出现变更", () => {
    const stack = new MonoStack<string>();
    stack.push("-", 0);
    stack.push("-", 1);
    stack.push("*", 0);
    // 长度为1
    expect(stack.length).toBe(1);
    // 栈顶元素为*
    expect(stack.peek()).toBe("*");
  });
  /**
   * a
   *  b
   *   c
   *    d
   *     e
   * f
   *  g
   */
  it("压栈时出现变更2", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 0);
    stack.push("b", 1);
    stack.push("c", 2);
    stack.push("d", 3);
    stack.push("e", 4);
    stack.push("f", 0);
    stack.push("g", 1);
    // 长度为2
    expect(stack.length).toBe(2);
    // 栈顶元素为g
    expect(stack.peek()).toBe("g");
  });
  /**
   * a
   *  b
   *   c
   *  d
   *   e
   *   f
   */
  it("压栈时出现变更3，有平行元素", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 0);
    stack.push("b", 1);
    stack.push("c", 2);
    stack.push("d", 1);
    stack.push("e", 2);
    stack.push("f", 2);
    // 长度为
    expect(stack.length).toBe(3);
    // 栈顶元素为f
    expect(stack.peek()).toBe("f");
  });
  /**
   * a
   *  b
   *   c
   *  d
   *   e
   *   f
   */
  it("压栈时出现变更4，有平行元素，逐步执行", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 0);
    expect(stack.length).toBe(1);
    expect(stack.peek()).toBe("a");

    stack.push("b", 1);
    expect(stack.length).toBe(2);
    expect(stack.peek()).toBe("b");

    stack.push("c", 2);
    expect(stack.length).toBe(3);
    expect(stack.peek()).toBe("c");

    stack.push("d", 1);
    expect(stack.length).toBe(2);
    expect(stack.peek()).toBe("d");

    stack.push("e", 2);
    expect(stack.length).toBe(3);
    expect(stack.peek()).toBe("e");

    stack.push("f", 2);
    expect(stack.length).toBe(3);
    expect(stack.peek()).toBe("f");
  });

  it("unsafeGet", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 0);
    stack.push("b", 1);
    stack.push("c", 2);
    expect(stack.unsafeGet(0)).toBe("a");
    expect(stack.unsafeGet(1)).toBe("b");
    expect(stack.unsafeGet(2)).toBe("c");
  });

  it("unsafeGet异常", () => {
    const stack = new MonoStack<string>();
    stack.push("a", 0);
    stack.push("b", 1);
    stack.push("c", 2);
    expect(() => stack.unsafeGet(3)).toThrow();
  });
});
