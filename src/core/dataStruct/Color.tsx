import { Serialized } from "../../types/node";

/**
 * 颜色对象
 * 不透明度最大值为1，最小值为0
 */
export class Color {
  static White = new Color(255, 255, 255);
  static Black = new Color(0, 0, 0);
  static Red = new Color(255, 0, 0);
  static Green = new Color(0, 255, 0);
  static Blue = new Color(0, 0, 255);
  static Yellow = new Color(255, 255, 0);
  static Cyan = new Color(0, 255, 255);
  static Magenta = new Color(255, 0, 255);
  static Transparent = new Color(0, 0, 0, 0);

  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number = 1,
  ) {}

  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }
  /**
   * 将字符串十六进制转成颜色对象，注意带井号
   * @param hex
   * @returns
   */
  static fromHex(hex: string) {
    hex = hex.replace("#", "");
    hex = hex.toUpperCase();

    if (hex.length === 6) {
      // hex = "FF" + hex;  // 这一行代码是AI补出来的，实际上这是错的，被坑了
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return new Color(r, g, b);
    } else {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16);
      return new Color(r, g, b, a);
    }
  }
  /**
   * 将此颜色转换为透明色，
   * 和(0, 0, 0, 0)不一样
   * 因为(0, 0, 0, 0)是黑色的透明色，在颜色线性混合的时候会偏黑
   * @returns
   */
  toTransparent() {
    return new Color(this.r, this.g, this.b, 0);
  }

  /**
   * 判断自己是否和另一个颜色相等
   */

  equals(color: Color) {
    return (
      this.r === color.r &&
      this.g === color.g &&
      this.b === color.b &&
      this.a === color.a
    );
  }

  toArray(): Serialized.Color {
    return [this.r, this.g, this.b, this.a];
  }
}

/**
 * 获取两个颜色的中间过渡色（线性混合）
 * 根据两个颜色，以及一个 0~1 的权重，返回一个新的颜色
 * 0 权重返回 color1，1 权重返回 color2
 * @param color1 颜色1
 * @param color2 颜色2
 */
export function mixColors(color1: Color, color2: Color, weight: number): Color {
  const r = Math.round(color1.r * (1 - weight) + color2.r * weight);
  const g = Math.round(color1.g * (1 - weight) + color2.g * weight);
  const b = Math.round(color1.b * (1 - weight) + color2.b * weight);
  const a = color1.a * (1 - weight) + color2.a * weight;
  return new Color(r, g, b, a);
}
