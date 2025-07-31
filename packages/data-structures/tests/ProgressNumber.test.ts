import { describe, expect, it } from "vitest";
import { ProgressNumber } from "../src/ProgressNumber";

describe("ProgressNumber 进度", () => {
  it("构造和基本属性", () => {
    const progress = new ProgressNumber(50, 100);
    expect(progress.curValue).toBe(50);
    expect(progress.maxValue).toBe(100);
  });

  it("计算百分比和比率", () => {
    const progress = new ProgressNumber(25, 100);
    expect(progress.percentage).toBe(25);
    expect(progress.rate).toBe(0.25);
  });

  it("判断是否已满或已空", () => {
    const progress1 = new ProgressNumber(100, 100);
    expect(progress1.isFull).toBe(true);
    const progress2 = new ProgressNumber(0, 100);
    expect(progress2.isEmpty).toBe(true);
    const progress3 = new ProgressNumber(50, 100);
    expect(progress3.isFull).toBe(false);
    expect(progress3.isEmpty).toBe(false);
  });

  it("设为已满或已空", () => {
    const progress = new ProgressNumber(50, 100);
    progress.setFull();
    expect(progress.curValue).toBe(100);
    progress.setEmpty();
    expect(progress.curValue).toBe(0);
  });

  it("增加值", () => {
    const progress = new ProgressNumber(50, 100);
    progress.add(20);
    expect(progress.curValue).toBe(70);
    progress.add(40); // 超出最大值
    expect(progress.curValue).toBe(100);
  });

  it("减少值", () => {
    const progress = new ProgressNumber(50, 100);
    progress.subtract(20);
    expect(progress.curValue).toBe(30);
    progress.subtract(40); // 低于0
    expect(progress.curValue).toBe(0);
  });

  it("克隆", () => {
    const progress1 = new ProgressNumber(50, 100);
    const progress2 = progress1.clone();
    expect(progress1).not.toBe(progress2);
    expect(progress1.curValue).toBe(progress2.curValue);
    expect(progress1.maxValue).toBe(progress2.maxValue);
  });
});
