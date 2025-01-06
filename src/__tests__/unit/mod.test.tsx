import { describe, it, expect } from "vitest";
import { NumberFunctions } from "../../core/algorithm/numberFunctions";

describe("mod.test.tsx", () => {
  it("should pass", () => {
    expect(NumberFunctions.mod(-9, 10)).toBe(1);
    expect(NumberFunctions.mod(-11, 10)).toBe(9);
    expect(NumberFunctions.mod(9, 10)).toBe(9);
    expect(NumberFunctions.mod(0, 10)).toBe(0);
    expect(NumberFunctions.mod(10, 10)).toBe(0);
    expect(NumberFunctions.mod(12, 10)).toBe(2);
  });
});
