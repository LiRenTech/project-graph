import { FONT, replaceTextWhenProtect } from "../../../../utils/font";
import { LruCache } from "../../../dataStruct/Cache";
import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";
import { Project, service } from "../../../Project";

/**
 * 专门用于在Canvas上渲染文字
 * 注意：基于View坐标系
 */
@service("textRenderer")
export class TextRenderer {
  constructor(private readonly project: Project) {}

  /**
   * 从左上角画文本
   * @param text
   * @param location
   * @param fontSize
   * @param color
   */
  renderOneLineText(text: string, location: Vector, fontSize: number, color: Color = Color.White): void {
    // alphabetic, top, hanging, middle, ideographic, bottom
    text = this.project.renderer.protectingPrivacy ? replaceTextWhenProtect(text) : text;
    this.project.canvas.ctx.textBaseline = "middle";
    this.project.canvas.ctx.textAlign = "left";
    if (this.project.renderer.textIntegerLocationAndSizeRender) {
      this.project.canvas.ctx.font = `${Math.round(fontSize)}px ${FONT}`;
    } else {
      this.project.canvas.ctx.font = `${fontSize}px normal ${FONT}`;
    }
    this.project.canvas.ctx.fillStyle = color.toString();
    if (this.project.renderer.textIntegerLocationAndSizeRender) {
      this.project.canvas.ctx.fillText(text, Math.floor(location.x), Math.floor(location.y + fontSize / 2));
    } else {
      this.project.canvas.ctx.fillText(text, location.x, location.y + fontSize / 2);
    }
  }

  /**
   * 从中心位置开始绘制文本
   * @param text
   * @param centerLocation
   * @param size
   * @param color
   * @param shadowColor
   */
  renderTextFromCenter(text: string, centerLocation: Vector, size: number, color: Color = Color.White): void {
    text = this.project.renderer.protectingPrivacy ? replaceTextWhenProtect(text) : text;
    this.project.canvas.ctx.textBaseline = "middle";
    this.project.canvas.ctx.textAlign = "center";
    if (this.project.renderer.textIntegerLocationAndSizeRender) {
      this.project.canvas.ctx.font = `${Math.round(size)}px normal ${FONT}`;
    } else {
      this.project.canvas.ctx.font = `${size}px normal ${FONT}`;
    }
    this.project.canvas.ctx.fillStyle = color.toString();
    if (this.project.renderer.textIntegerLocationAndSizeRender) {
      this.project.canvas.ctx.fillText(text, Math.floor(centerLocation.x), Math.floor(centerLocation.y));
    } else {
      this.project.canvas.ctx.fillText(text, centerLocation.x, centerLocation.y);
    }
    // 重置阴影
    this.project.canvas.ctx.shadowBlur = 0; // 阴影模糊程度
    this.project.canvas.ctx.shadowOffsetX = 0; // 水平偏移
    this.project.canvas.ctx.shadowOffsetY = 0; // 垂直偏移
    this.project.canvas.ctx.shadowColor = "none";
  }

  /**
   * 渲染多行文本
   * @param text
   * @param location
   * @param fontSize
   * @param color
   * @param lineHeight
   */
  renderMultiLineText(
    text: string,
    location: Vector,
    fontSize: number,
    limitWidth: number,
    color: Color = Color.White,
    lineHeight: number = 1.2,
    limitLines: number = Infinity,
  ): void {
    text = this.project.renderer.protectingPrivacy ? replaceTextWhenProtect(text) : text;
    let currentY = 0; // 顶部偏移量
    let textLineArray = this.textToTextArrayWrapCache(text, fontSize, limitWidth);
    // 限制行数
    if (limitLines < textLineArray.length) {
      textLineArray = textLineArray.slice(0, limitLines);
      textLineArray[limitLines - 1] += "..."; // 最后一行加省略号
    }
    for (const line of textLineArray) {
      this.renderOneLineText(line, location.add(new Vector(0, currentY)), fontSize, color);
      currentY += fontSize * lineHeight;
    }
  }

  renderMultiLineTextFromCenter(
    text: string,
    centerLocation: Vector,
    size: number,
    limitWidth: number,
    color: Color,
    lineHeight: number = 1.2,
    limitLines: number = Infinity,
  ): void {
    text = this.project.renderer.protectingPrivacy ? replaceTextWhenProtect(text) : text;
    let currentY = 0; // 顶部偏移量
    let textLineArray = this.textToTextArrayWrapCache(text, size, limitWidth);
    // 限制行数
    if (limitLines < textLineArray.length) {
      textLineArray = textLineArray.slice(0, limitLines);
      textLineArray[limitLines - 1] += "..."; // 最后一行加省略号
    }
    for (const line of textLineArray) {
      this.renderTextFromCenter(
        line,
        centerLocation.add(new Vector(0, currentY - ((textLineArray.length - 1) * size) / 2)),
        size,
        color,
      );
      currentY += size * lineHeight;
    }
  }

  textArrayCache: LruCache<string, string[]> = new LruCache(100);

  /**
   * 加了缓存后的多行文本渲染函数
   * @param text
   * @param fontSize
   * @param limitWidth
   */
  private textToTextArrayWrapCache(text: string, fontSize: number, limitWidth: number): string[] {
    const cacheKey = `${fontSize}_${limitWidth}_${text}`;
    const cacheValue = this.textArrayCache.get(cacheKey);
    if (cacheValue) {
      return cacheValue;
    }
    const lines = this.textToTextArray(text, fontSize, limitWidth);
    this.textArrayCache.set(cacheKey, lines);
    return lines;
  }

  /**
   * 渲染多行文本的辅助函数
   * 将一段字符串分割成多行数组，遇到宽度限制和换行符进行换行。
   * @param text
   */
  private textToTextArray(text: string, fontSize: number, limitWidth: number): string[] {
    let currentLine = "";
    // 先渲染一下空字符串，否则长度大小可能不匹配，造成蜜汁bug
    this.renderOneLineText("", Vector.getZero(), fontSize, Color.White);
    const lines: string[] = [];

    for (const char of text) {
      // 新来字符的宽度
      const measureSize = this.project.canvas.ctx.measureText(currentLine + char);
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

  /**
   * 测量多行文本的大小
   * @param text
   * @param fontSize
   * @param limitWidth
   * @returns
   */
  measureMultiLineTextSize(text: string, fontSize: number, limitWidth: number, lineHeight: number = 1.2): Vector {
    const lines = this.textToTextArrayWrapCache(text, fontSize, limitWidth);
    let maxWidth = 0;
    let totalHeight = 0;
    for (const line of lines) {
      const measureSize = this.project.canvas.ctx.measureText(line);
      maxWidth = Math.max(maxWidth, measureSize.width);
      totalHeight += fontSize * lineHeight;
    }
    return new Vector(Math.ceil(maxWidth), totalHeight);
  }
}
