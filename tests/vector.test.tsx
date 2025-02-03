import { describe, expect, it } from "vitest";
import { Vector } from "../src/core/dataStruct/Vector";

describe("Vector", () => {
  it("1+1=2", () => {
    expect(1 + 1).toEqual(2);
  });
  it("v1+v2", () => {
    const v1 = new Vector(1, 2);
    const v2 = new Vector(3, 4);
    const v3 = v1.add(v2);
    expect(v3.x).toEqual(4);
    expect(v3.y).toEqual(6);
  });
});
