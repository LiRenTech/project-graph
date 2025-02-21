import { describe, expect, it } from "vitest";
import { LimitLengthQueue } from "../src/core/dataStruct/LimitLengthQueue";

describe("mod.test.tsx", () => {
  it("should pass", () => {
    const limitLengthQueue = new LimitLengthQueue<number>(3);
    limitLengthQueue.enqueue(1);
    limitLengthQueue.enqueue(2);
    limitLengthQueue.enqueue(3);
    limitLengthQueue.enqueue(4);
    expect(limitLengthQueue.peek()).eq(2);
    expect(limitLengthQueue.tail()).eq(4);
  });

  it("should pass", () => {
    const limitLengthQueue = new LimitLengthQueue<number>(3);
    limitLengthQueue.enqueue(1);
    limitLengthQueue.enqueue(2);
    limitLengthQueue.enqueue(3);
    limitLengthQueue.enqueue(4);
    expect(Math.max(...limitLengthQueue.multiGetTail(3))).eq(4);
    expect(limitLengthQueue.length).eq(3);
    expect(Math.min(...limitLengthQueue.multiGetTail(3))).eq(2);
  });
});
