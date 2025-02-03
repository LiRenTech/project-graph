import { describe, it, expect } from "vitest";

describe("测试测试框架是否正常运行", () => {
  it("1+1=2", () => {
    expect(1 + 1).toEqual(2);
  });

  it("2+2=4", () => {
    expect(2 + 2).toEqual(4);
  });

  it("0.1+0.2 ", () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3, 1);
    expect(0.1 + 0.2).toBeCloseTo(0.3, 2);
    expect(0.1 + 0.2).toBeCloseTo(0.3, 3);
    expect(0.1 + 0.2).toBeCloseTo(0.3, 4);
    expect(0.1 + 0.2).toBeCloseTo(0.3, 5);
    expect(0.1 + 0.2).toBeCloseTo(0.3, 10);
    expect(0.1 + 0.2).toBeCloseTo(0.3, 15);
    // expect(0.1 + 0.2).toBeCloseTo(0.3, 16);
  });
});
