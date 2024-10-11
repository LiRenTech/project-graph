import { Vector } from "../core/dataStruct/Vector";

/**
 * 测量文本的宽度（高度不测量）
 * 不要在循环中调用，会影响性能
 * @param text
 * @param size
 * @returns
 */
export function getTextSize(text: string, size: number): Vector {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get canvas context");
  }
  context.font = `${size}px MiSans`;
  const metrics = context.measureText(text);
  return new Vector(metrics.width, size);
}
