import { describe, expect, it } from "vitest";
import { averageColors, Color, colorInvert, mixColors } from "../src/Color";

describe("Color 颜色", () => {
  it("构造", () => {
    const color = new Color(255, 128, 0, 0.5);
    expect(color.r).toBe(255);
    expect(color.g).toBe(128);
    expect(color.b).toBe(0);
    expect(color.a).toBe(0.5);
  });

  it("转字符串", () => {
    const color = new Color(255, 0, 0);
    expect(color.toString()).toBe("rgba(255, 0, 0, 1)");
  });

  it("转十六进制字符串", () => {
    expect(new Color(255, 255, 255, 1).toHexString()).toBe("#ffffff01");
    expect(new Color(255, 0, 0, 1).toHexString()).toBe("#ff000001");
  });

  it("转十六进制字符串（无透明度）", () => {
    const color = new Color(255, 0, 0, 0.5);
    expect(color.toHexStringWithoutAlpha()).toBe("#ff0000");
  });

  it("克隆", () => {
    const color1 = new Color(1, 2, 3, 0.5);
    const color2 = color1.clone();
    expect(color1).not.toBe(color2);
    expect(color1.equals(color2)).toBe(true);
  });

  it("从十六进制创建", () => {
    const color1 = Color.fromHex("#ff0000");
    expect(color1.equals(new Color(255, 0, 0, 1))).toBe(true);
    const color2 = Color.fromHex("#00ff0080");
    expect(color2.equals(new Color(0, 255, 0, 128))).toBe(true);
  });

  it("从CSS创建", () => {
    expect(Color.fromCss("#f00").equals(Color.Red)).toBe(true);
    expect(Color.fromCss("#ff0000").equals(Color.Red)).toBe(true);
    expect(Color.fromCss("rgb(0, 255, 0)").equals(Color.Green)).toBe(true);
    expect(Color.fromCss("rgba(0, 0, 255, 0.5)").equals(new Color(0, 0, 255, 0.5))).toBe(true);
    expect(Color.fromCss("transparent").equals(Color.Transparent)).toBe(true);
  });

  it("相等判断", () => {
    const color1 = new Color(1, 2, 3, 0.5);
    const color2 = new Color(1, 2, 3, 0.5);
    const color3 = new Color(4, 5, 6, 1);
    expect(color1.equals(color2)).toBe(true);
    expect(color1.equals(color3)).toBe(false);
  });

  it("降低饱和度", () => {
    const color = new Color(255, 0, 0); // Red
    const desaturated = color.desaturate(0.5);
    expect(desaturated.r).toBeGreaterThan(160);
    expect(desaturated.g).toBeCloseTo(desaturated.b);
  });

  it("改变色相", () => {
    const red = new Color(255, 0, 0);
    const green = red.changeHue(120);
    expect(green.r).toBeLessThan(10);
    expect(green.g).toBeGreaterThan(245);
    expect(green.b).toBeLessThan(10);
  });
});

describe("颜色辅助函数", () => {
  it("颜色反转", () => {
    expect(colorInvert(Color.White).equals(Color.Black)).toBe(true);
    expect(colorInvert(Color.Black).equals(Color.White)).toBe(true);
  });

  it("颜色混合", () => {
    const red = Color.Red;
    const blue = Color.Blue;
    const purple = mixColors(red, blue, 0.5);
    expect(purple.r).toBe(128);
    expect(purple.g).toBe(0);
    expect(purple.b).toBe(128);
  });

  it("计算平均色", () => {
    const colors = [Color.Red, Color.Green, Color.Blue];
    const avg = averageColors(colors);
    expect(avg.r).toBe(85);
    expect(avg.g).toBe(85);
    expect(avg.b).toBe(85);
  });
});
