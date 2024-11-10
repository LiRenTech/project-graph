import { MaxSizeCache } from "../core/dataStruct/Cache";
import { Vector } from "../core/dataStruct/Vector";

const _canvas = document.createElement("canvas");
const _context = _canvas.getContext("2d");

const _cache = new MaxSizeCache<string, number>(10000);

let useCache = false;
/**
 * 测量文本的宽度（高度不测量）
 * 不要在循环中调用，会影响性能
 * @param text
 * @param size
 * @returns
 */
export function getTextSize(text: string, size: number): Vector {
  // const t1 = performance.now();
  if (useCache) {
    const value = _cache.get(`${text}-${size}`);
    if (value) {
      return new Vector(value, size);
    }
  }

  if (!_context) {
    throw new Error("Failed to get canvas context");
  }
  
  _context.font = `${size}px MiSans`;
  const metrics = _context.measureText(text);
  // const t2 = performance.now();
  if (useCache) {
    _cache.set(`${text}-${size}`, metrics.width)
  }
  // console.log(t2 - t1);
  return new Vector(metrics.width, size);
}
