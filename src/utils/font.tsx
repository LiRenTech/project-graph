import { Vector } from "../core/dataStruct/Vector";

const _canvas = document.createElement("canvas");
const _context = _canvas.getContext("2d");

/**
 * 测量文本的宽度（高度不测量）
 * 不要在循环中调用，会影响性能
 * @param text
 * @param size
 * @returns
 */
export function getTextSize(text: string, size: number): Vector {
  // const t1 = performance.now();

  if (!_context) {
    throw new Error("Failed to get canvas context");
  }
  
  _context.font = `${size}px MiSans`;
  const metrics = _context.measureText(text);
  // const t2 = performance.now();

  // console.log(t2 - t1);
  return new Vector(metrics.width, size);
}
