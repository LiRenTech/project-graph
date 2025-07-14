import { MaxSizeCache } from "../core/dataStruct/Cache";
import { Vector } from "../core/dataStruct/Vector";
import { isMac } from "./platform";

const _canvas = document.createElement("canvas");
const _context = _canvas.getContext("2d");

const _cache = new MaxSizeCache<string, number>(10000);

/** canvas中使用的字体 */
export let FONT = "-apple-system, BlinkMacSystemFont, MiSans, system-ui, sans-serif";
if (isMac) {
  FONT = "PingFang SC, PingFang TC, -apple-system";
}

// eslint-disable-next-line prefer-const
let useCache = true;
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

  _context.font = `${size}px normal ${FONT}`;
  const metrics = _context.measureText(text);
  // const t2 = performance.now();
  if (useCache) {
    _cache.set(`${text}-${size}`, metrics.width);
  }

  return new Vector(metrics.width, size);
}

/**
 * 获取多行文本的宽度和高度
 * @param text
 * @param fontSize
 * @param lineHeight 行高，是一个比率
 * @returns
 */
export function getMultiLineTextSize(text: string, fontSize: number, lineHeight: number): Vector {
  const lines = text.split("\n");
  let width = 0;
  let height = 0;
  for (const line of lines) {
    const size = getTextSize(line, fontSize);
    width = Math.max(width, size.x);
    height += size.y * lineHeight;
  }
  return new Vector(width, height);
}

/**
 * 所有的汉字替换成“㊙”
 * 所有小写字母替换成 a，大写字母替换成 A
 * 所有数字全部替换成 6
 * @param text
 */
export function replaceTextWhenProtect(text: string) {
  return text
    .replace(/[\u4e00-\u9fa5]/g, "㊙")
    .replace(/[a-z]/g, "a")
    .replace(/[A-Z]/g, "A")
    .replace(/\d/g, "6");
}

export function camelCaseToDashCase(text: string) {
  return text.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
