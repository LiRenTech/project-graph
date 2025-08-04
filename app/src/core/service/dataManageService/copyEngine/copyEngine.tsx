import { Project, service } from "@/core/Project";
import { Entity } from "@/core/stage/stageObject/abstract/StageEntity";
import { CollisionBox } from "@/core/stage/stageObject/collisionBox/collisionBox";
import { ImageNode } from "@/core/stage/stageObject/entity/ImageNode";
import { SvgNode } from "@/core/stage/stageObject/entity/SvgNode";
import { TextNode } from "@/core/stage/stageObject/entity/TextNode";
import { UrlNode } from "@/core/stage/stageObject/entity/UrlNode";
import { Serialized } from "@/types/node";
import { PathString } from "@/utils/pathString";
import { isMac } from "@/utils/platform";
import { Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import { readImage, readText } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "sonner";
import { MouseLocation } from "../../controlService/MouseLocation";
import { RectanglePushInEffect } from "../../feedbackService/effectEngine/concrete/RectanglePushInEffect";

/**
 * 专门用来管理节点复制的引擎
 */
@service("copyEngine")
export class CopyEngine {
  constructor(private readonly project: Project) {}

  /**
   * 虚拟粘贴板数据
   * 注意：这个不是系统粘贴板
   */
  copyBoardData: Serialized.File = {
    version: Project.latestVersion,
    entities: [],
    associations: [],
    tags: [],
  };
  /**
   * 粘贴板内容上的外接矩形
   * 当他为null时，表示没有粘贴板数据
   */

  copyBoardDataRectangle: Rectangle | null = null;
  /**
   * 表示从粘贴板外接矩形的矩形中心，到鼠标当前位置的向量
   * 用于计算即将粘贴的位置
   */

  copyBoardMouseVector: Vector = Vector.getZero();

  /**
   * 清空虚拟粘贴板
   */
  clearVirtualCopyBoardData() {
    this.copyBoardData = {
      version: StageDumper.latestVersion,
      entities: [],
      associations: [],
      tags: [],
    };
    this.copyBoardDataRectangle = null;
  }

  /**
   * 用户按下了ctrl+c，
   * 将当前选中的节点复制到虚拟粘贴板
   * 也要将选中的部分复制到系统粘贴板
   */
  copy() {
    // 获取所有选中的实体
    const entities: Entity[] = this.project.stageManager.getSelectedEntities();
    if (entities.length === 0) {
      // 如果没有选中东西，就是清空虚拟粘贴板
      this.clearVirtualCopyBoardData();
      return;
    }
    // 更新虚拟剪贴板
    this.copyBoardData = StageDumper.dumpSelected(entities);

    // 更新虚拟粘贴板形状
    this.updateRectangle();

    // 更新系统剪贴板
    const clipboardItems = [];
    for (const entity of entities) {
      if (entity instanceof TextNode) {
        clipboardItems.push(entity.text);
      }
    }
    if (clipboardItems.length > 0) {
      const clipboardText = clipboardItems.join("\n");
      navigator.clipboard.writeText(clipboardText);
    }
    // 如果选中了图片，则优先处理图片
    // BUG: copyEngine.tsx:106
    // Uncaught (in promise) NotAllowedError: Failed to execute 'write' on 'Clipboard': Support for multiple ClipboardItems is not implemented.
    // 当图片节点和文本节点同时复制的时候会报错
    const systemClipboardItems = [];
    for (const entity of entities) {
      if (entity instanceof ImageNode) {
        systemClipboardItems.push(this.getImageClipboardItem(entity));
      } else if (entity instanceof TextNode) {
        systemClipboardItems.push(this.getTextNodeClipboardItem(entity));
      }
    }
    if (systemClipboardItems.length > 0) {
      navigator.clipboard.write(systemClipboardItems);
    }
  }

  private getTextNodeClipboardItem(textNode: TextNode) {
    try {
      let clipboardText = textNode.text;
      if (textNode.details.trim() !== "") {
        clipboardText += "\n" + textNode.details;
      }
      const clipboardItem = new ClipboardItem({ "text/plain": clipboardText });
      return clipboardItem;
    } catch (err) {
      console.error("Failed to copy text: ", err);
      return new ClipboardItem({ "text/plain": "文本节点转换为剪贴板文字失败" });
    }
  }

  private getImageClipboardItem(entityImage: ImageNode) {
    const base64String = "data:image/png;base64," + entityImage.base64String;
    try {
      // 将 Base64 字符串转换为 Blob 对象
      const byteCharacters = atob(base64String.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // 创建一个 ClipboardItem 对象
      const data = new ClipboardItem({ "image/png": blob });

      return data;
    } catch (err) {
      console.error("Failed to copy image: ", err);
      return new ClipboardItem({ "text/plain": "拷贝图片失败" });
    }
  }

  isVirtualClipboardEmpty() {
    return this.copyBoardData.entities.length === 0;
  }

  /**
   * 用户按下了ctrl+v，将粘贴板数据粘贴到画布上
   */
  paste() {
    // 如果有虚拟粘贴板数据，则优先粘贴虚拟粘贴板上的东西
    if (this.isVirtualClipboardEmpty()) {
      this.readClipboard();
    } else {
      // SerializedDataAdder.addSerializedData(this.copyBoardData, this.copyBoardMouseVector);
    }
    if (isMac) {
      // mac下无法直接粘贴，还要点一个按钮，但这导致
      // 按下按钮后，程序中依然显示 meta v 仍然在按下状态
      // 因此需要主动删除
      setTimeout(() => {
        this.project.controller.pressingKeySet.clear();
      }, 500);
    }
  }

  pasteWithOriginLocation() {
    // SerializedDataAdder.addSerializedData(this.copyBoardData);
  }

  private updateRectangle() {
    const rectangles = [];
    for (const node of this.copyBoardData.entities) {
      if (node.type === "core:connect_point") {
        rectangles.push(new Rectangle(new Vector(...node.location), new Vector(1, 1)));
      } else if (node.type === "core:pen_stroke") {
        // rectangles.push(new Rectangle(new Vector(...node.location), new Vector(1, 1)));
        // TODO: 画笔粘贴板矩形暂时不考虑
      } else {
        rectangles.push(new Rectangle(new Vector(...node.location), new Vector(...node.size)));
      }
    }

    const clipboardRect = Rectangle.getBoundingRectangle(rectangles);
    this.copyBoardDataRectangle = clipboardRect;
  }

  async readClipboard() {
    try {
      const text = await readText();
      this.copyEnginePastePlainText(text);
    } catch (err) {
      console.warn("文本剪贴板是空的", err);
    }
    try {
      // https://github.com/HuLaSpark/HuLa/blob/fe37c246777cde3325555ed2ba2fcf860888a4a8/src/utils/ImageUtils.ts#L121
      const image = await readImage();
      const imageData = await image.rgba();
      const { width, height } = await image.size();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      const canvasImageData = ctx.createImageData(width, height);
      let uint8Array: Uint8Array;
      if (imageData.buffer instanceof ArrayBuffer) {
        uint8Array = new Uint8Array(imageData.buffer, imageData.byteOffset, imageData.byteLength);
      } else {
        uint8Array = new Uint8Array(imageData);
      }
      canvasImageData.data.set(uint8Array);
      ctx.putImageData(canvasImageData, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject();
          } else {
            resolve(blob);
          }
        }, "image/avif");
      });
      this.copyEnginePasteImage(blob);
    } catch (err) {
      console.warn("图片剪贴板是空的", err);
    }
  }

  async copyEnginePastePlainText(item: string) {
    let entity: Entity | null = null;
    const collisionBox = new CollisionBox([
      new Rectangle(this.project.renderer.transformView2World(MouseLocation.vector()), Vector.getZero()),
    ]);

    if (isSvgString(item)) {
      // 是SVG类型
      entity = new SvgNode(this.project, {
        content: item,
        collisionBox,
      });
    } else if (PathString.isValidURL(item)) {
      // 是URL类型
      entity = new UrlNode(this.project, {
        title: "链接",
        uuid: crypto.randomUUID(),
        url: item,
        location: [MouseLocation.x, MouseLocation.y],
      });
    } else if (isMermaidGraphString(item)) {
      // 是Mermaid图表类型
      entity = new TextNode(this.project, {
        text: "mermaid图表",
        details: "```mermaid\n" + item + "\n```",
        collisionBox,
      });
    } else {
      const { valid, text, url } = PathString.isMarkdownUrl(item);
      if (valid) {
        // 是Markdown链接类型
        entity = new UrlNode(this.project, {
          title: text,
          uuid: crypto.randomUUID(),
          url: url,
          location: [MouseLocation.x, MouseLocation.y],
        });
      } else {
        // 只是普通的文本
        if (item.length > 3000) {
          entity = new TextNode(this.project, {
            text: "粘贴板文字过长",
            collisionBox,
            details: item,
          });
        } else {
          entity = new TextNode(this.project, {
            text: item,
            collisionBox,
          });
          // entity.move(
          //   new Vector(-entity.collisionBox.getRectangle().width / 2, -entity.collisionBox.getRectangle().height / 2),
          // );
        }
      }
    }

    if (entity !== null) {
      this.project.stageManager.add(entity);
      // 添加到section
      const mouseSections = this.project.sectionMethods.getSectionsByInnerLocation(MouseLocation);
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

  async copyEnginePasteImage(item: Blob) {
    const attachmentId = this.project.addAttachment(item);

    const imageNode = new ImageNode(this.project, {
      attachmentId,
    });
    this.project.stageManager.add(imageNode);
  }
}

export function getRectangleFromSerializedEntities(serializedEntities: Serialized.Entity[]): Rectangle {
  const rectangles = [];
  for (const node of serializedEntities) {
    if (
      Serialized.isTextNode(node) ||
      Serialized.isSection(node) ||
      Serialized.isImageNode(node) ||
      Serialized.isUrlNode(node) ||
      Serialized.isPortalNode(node) ||
      Serialized.isSvgNode(node)
    ) {
      // 比较常规的矩形
      rectangles.push(new Rectangle(new Vector(...node.location), new Vector(...node.size)));
    }
    if (node.type === "core:connect_point") {
      rectangles.push(new Rectangle(new Vector(...node.location), new Vector(1, 1)));
    } else if (node.type === "core:pen_stroke") {
      // rectangles.push(new Rectangle(new Vector(...node.location), new Vector(1, 1)));
      // TODO: 画笔粘贴板矩形暂时不考虑
    }
  }
  return Rectangle.getBoundingRectangle(rectangles);
}

function isSvgString(str: string): boolean {
  const trimmed = str.trim();

  // 基础结构检查
  if (trimmed.startsWith("<svg") || trimmed.endsWith("</svg>")) {
    return true;
  }

  // 提取 <svg> 标签的属性部分
  const openTagMatch = trimmed.match(/<svg/i);
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
    } catch {
      // 解析失败则直接失败
      toast.error("SVG 解析失败");
      return false;
    }
  }

  return true;
}

function isMermaidGraphString(str: string): boolean {
  str = str.trim();
  if (str.startsWith("graph TD;") && str.endsWith(";")) {
    return true;
  }
  return false;
}
