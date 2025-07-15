import { Vector } from "@graphif/data-structures";
import { v4 as uuidv4 } from "uuid";
import { Dialog } from "../../../../components/dialog";
import { PathString } from "../../../../utils/pathString";
import { Entity } from "../../../stage/stageObject/abstract/StageEntity";
import { SvgNode } from "../../../stage/stageObject/entity/SvgNode";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../stage/stageObject/entity/UrlNode";
import { RectanglePushInEffect } from "../../feedbackService/effectEngine/concrete/RectanglePushInEffect";

/**
 * 复制粘贴引擎 粘贴各种各样的纯文本 处理函数
 * @param item
 * @param mouseLocation
 */
export async function copyEnginePastePlainText(item: ClipboardItem, mouseLocation: Vector) {
  const blob = await item.getType("text/plain"); // 获取文本内容
  // const text = await blob.text();
  const clipboardText = await blobToText(blob); // 将 Blob 转换为文本
  let entity: Entity | null = null;

  if (isSvgString(clipboardText)) {
    // 是SVG类型
    entity = new SvgNode(this.project, {
      uuid: uuidv4(),
      content: clipboardText,
      location: [mouseLocation.x, mouseLocation.y],
      size: [400, 100],
      color: [0, 0, 0, 0],
    });
  } else if (PathString.isValidURL(clipboardText)) {
    // 是URL类型
    entity = new UrlNode(this.project, {
      title: "链接",
      uuid: uuidv4(),
      url: clipboardText,
      location: [mouseLocation.x, mouseLocation.y],
    });
  } else if (isMermaidGraphString(clipboardText)) {
    // 是Mermaid图表类型
    entity = new TextNode(this.project, {
      text: "mermaid图表",
      details: "```mermaid\n" + clipboardText + "\n```",
      uuid: uuidv4(),
      location: [mouseLocation.x, mouseLocation.y],
    });
  } else {
    const { valid, text, url } = PathString.isMarkdownUrl(clipboardText);
    if (valid) {
      // 是Markdown链接类型
      entity = new UrlNode(this.project, {
        title: text,
        uuid: uuidv4(),
        url: url,
        location: [mouseLocation.x, mouseLocation.y],
      });
    } else {
      // 只是普通的文本
      if (clipboardText.length > 3000) {
        entity = new TextNode(this.project, {
          uuid: uuidv4(),
          text: "粘贴板文字过长",
          location: [mouseLocation.x, mouseLocation.y],
          size: [400, 100],
          color: [0, 0, 0, 0],
          sizeAdjust: "manual",
          details: clipboardText,
        });
      } else {
        entity = new TextNode(this.project, {
          uuid: uuidv4(),
          text: clipboardText,
          location: [mouseLocation.x, mouseLocation.y],
          size: [400, 100],
          color: [0, 0, 0, 0],
          sizeAdjust: "manual",
        });
        entity.move(
          new Vector(-entity.collisionBox.getRectangle().width / 2, -entity.collisionBox.getRectangle().height / 2),
        );
      }
    }
  }

  if (entity !== null) {
    this.project.stageManager.add(entity);
    // 添加到section
    const mouseSections = this.project.sectionMethods.getSectionsByInnerLocation(mouseLocation);
    if (mouseSections.length > 0) {
      this.project.stageManager.goInSection([entity], mouseSections[0]);
      this.project.effects.addEffect(
        RectanglePushInEffect.sectionGoInGoOut(
          entity.collisionBox.getRectangle(),
          mouseSections[0].collisionBox.getRectangle(),
        ),
      );
    }
  }
}

function blobToText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string); // 读取完成时返回结果
    reader.onerror = () => reject(reader.error); // 读取出错时返回错误
    reader.readAsText(blob); // 读取 Blob 对象作为文本
  });
}

/**
 * 判断是否是SVG字符串
 * @param str 待检测的字符串
 */
function isSvgString(str: string): boolean {
  const trimmed = str.trim();

  // 基础结构检查
  if (
    !trimmed.startsWith("<svg") || // 是否以 <svg 开头
    !trimmed.endsWith("</svg>") // 是否以 </svg> 结尾
  ) {
    return false;
  }

  // 提取 <svg> 标签的属性部分
  const openTagMatch = trimmed.match(/<svg\s+([^>]*)>/i);
  if (!openTagMatch) return false; // 无有效属性则直接失败

  // 检查是否存在 xmlns 命名空间声明
  const xmlnsRegex = /xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/i;
  if (!xmlnsRegex.test(openTagMatch[1])) {
    return false;
  }

  // 可选：通过 DOM 解析进一步验证（仅限浏览器环境）
  // 若在 Node.js 等无 DOM 环境，可注释此部分
  if (typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, "image/svg+xml");
      const svgElement = doc.documentElement;
      return svgElement.tagName.toLowerCase() === "svg" && svgElement.namespaceURI === "http://www.w3.org/2000/svg";
    } catch (e) {
      // 解析失败则直接失败
      Dialog.show({
        title: "错误",
        content: "SVG 解析失败，请检查格式是否正确。",
        code: JSON.stringify(e),
        type: "error",
      });
      return false;
    }
  }

  return true;
}

/**
 * 检测是否是Mermaid图表字符串
 * @param str
 */
function isMermaidGraphString(str: string): boolean {
  str = str.trim();
  if (str.startsWith("graph TD;") && str.endsWith(";")) {
    return true;
  }
  return false;
}
