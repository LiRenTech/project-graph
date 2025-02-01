import { LruCache } from "../../../dataStruct/Cache";
import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";
import { Canvas } from "../../../stage/Canvas";

/**
 * 专门用于在Canvas上渲染文字
 * 注意：基于View坐标系
 */
export namespace TextRenderer {
  /**
   * 从左上角画文本
   * @param text
   * @param location
   * @param fontSize
   * @param color
   */
  export function renderText(text: string, location: Vector, fontSize: number, color: Color = Color.White): void {
    // alphabetic, top, hanging, middle, ideographic, bottom
    Canvas.ctx.textBaseline = "middle";
    Canvas.ctx.textAlign = "left";
    Canvas.ctx.font = `${fontSize}px MiSans`;
    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fillText(text, location.x, location.y + fontSize / 2);
  }

  /**
   * 从中心位置开始绘制文本
   * @param text
   * @param centerLocation
   * @param size
   * @param color
   * @param shadowColor
   * @param shadowBlurSize
   * @param shadowOffsetX
   * @param shadowOffsetY
   */
  export function renderTextFromCenter(
    text: string,
    centerLocation: Vector,
    size: number,
    color: Color = Color.White,
    shadowColor: Color = Color.Transparent,
    shadowBlurSize: number = 0,
    shadowOffsetX: number = 0,
    shadowOffsetY: number = 0,
  ): void {
    Canvas.ctx.textBaseline = "middle";
    Canvas.ctx.textAlign = "center";
    Canvas.ctx.font = `${size}px MiSans`;
    // 文字阴影
    if (!shadowColor.equals(Color.Transparent)) {
      Canvas.ctx.shadowColor = shadowColor.toString();
      Canvas.ctx.shadowBlur = shadowBlurSize; // 阴影模糊程度
      Canvas.ctx.shadowOffsetX = shadowOffsetX; // 水平偏移
      Canvas.ctx.shadowOffsetY = shadowOffsetY; // 垂直偏移
    }

    Canvas.ctx.fillStyle = color.toString();
    Canvas.ctx.fillText(text, centerLocation.x, centerLocation.y);
    // 重置阴影
    Canvas.ctx.shadowBlur = 0; // 阴影模糊程度
    Canvas.ctx.shadowOffsetX = 0; // 水平偏移
    Canvas.ctx.shadowOffsetY = 0; // 垂直偏移
    Canvas.ctx.shadowColor = "none";
  }

  /**
   * 渲染多行文本
   * @param text
   * @param location
   * @param fontSize
   * @param color
   * @param lineHeight
   */
  export function renderMultiLineText(
    text: string,
    location: Vector,
    fontSize: number,
    limitWidth: number,
    color: Color = Color.White,
    lineHeight: number = 1.2,
    limitLines: number = Infinity,
  ): void {
    let currentY = 0; // 顶部偏移量
    let textLineArray = textToTextArrayWrapCache(text, fontSize, limitWidth);
    // 限制行数
    if (limitLines < textLineArray.length) {
      textLineArray = textLineArray.slice(0, limitLines);
      textLineArray[limitLines - 1] += "..."; // 最后一行加省略号
    }
    for (const line of textLineArray) {
      renderText(line, location.add(new Vector(0, currentY)), fontSize, color);
      currentY += fontSize * lineHeight;
    }
  }

  const textArrayCache: LruCache<string, string[]> = new LruCache(100);

  /**
   * 加了缓存后的多行文本渲染函数
   * @param text
   * @param fontSize
   * @param limitWidth
   */
  function textToTextArrayWrapCache(text: string, fontSize: number, limitWidth: number): string[] {
    const cacheKey = `${fontSize}_${limitWidth}_${text}`;
    const cacheValue = textArrayCache.get(cacheKey);
    if (cacheValue) {
      return cacheValue;
    }
    const lines = textToTextArray(text, fontSize, limitWidth);
    textArrayCache.set(cacheKey, lines);
    return lines;
  }

  /**
   * 渲染多行文本的辅助函数
   * 将一段字符串分割成多行数组，遇到宽度限制和换行符进行换行。
   * @param text
   */
  function textToTextArray(text: string, fontSize: number, limitWidth: number): string[] {
    let currentLine = "";
    // 先渲染一下空字符串，否则长度大小可能不匹配，造成蜜汁bug
    renderText("", Vector.getZero(), fontSize, Color.White);
    const lines: string[] = [];

    for (const char of text) {
      // 新来字符的宽度
      const measureSize = Canvas.ctx.measureText(currentLine + char);
      // 先判断是否溢出
      if (measureSize.width > limitWidth || char === "\n") {
        // 溢出了，将这一整行渲染出来
        lines.push(currentLine);
        if (char !== "\n") {
          currentLine = char;
        } else {
          currentLine = "";
        }
      } else {
        // 未溢出，继续添加字符
        // 当前行更新
        currentLine += char;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }
}
