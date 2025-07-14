import { describe, it, expect } from "vitest";

function logAround(_target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Before calling ${key}`);
    const result = originalMethod.apply(this, args);
    console.log(`After calling ${key}`);
    return result;
  };

  return descriptor;
}

function addOne(_target: any, _key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const result = originalMethod.apply(this, args);
    return result + 1;
  };

  return descriptor;
}

export class TestClass {
  @logAround
  hello() {
    console.log("Hello, world!");
  }

  @addOne
  add(a: number, b: number) {
    return a + b;
  }
}

// namespace TestNameSpace {
//   function add(a: number, b: number): number {
//     return a + b;
//   }
// }
// 在 TypeScript 中，装饰器（decorators）不能直接应用于命名空间（namespace）中的函数。
// 装饰器通常用于类的方法、类本身、属性或参数上。

describe("deco.test.tsx", () => {
  // it("should pass", () => {
  //   const testClass = new TestClass();
  //   testClass.hello();
  // });
  it("should add one", () => {
    const testClass = new TestClass();
    const result = testClass.add(2, 3);
    expect(result).toBe(6);
  });
});
