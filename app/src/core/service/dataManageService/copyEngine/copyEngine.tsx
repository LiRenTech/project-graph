import { Serialized } from "../../../../types/node";
import { isMac } from "../../../../utils/platform";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Project, service } from "../../../Project";
import { StageDumper } from "../../../stage/StageDumper";
import { SerializedDataAdder } from "../../../stage/stageManager/concreteMethods/StageSerializedAdder";
import { Entity } from "../../../stage/stageObject/abstract/StageEntity";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { copyEnginePasteImage } from "./pasteImage";
import { copyEnginePastePlainText } from "./pastePlainText";

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
    version: StageDumper.latestVersion,
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
      readClipboardItems(this.project.renderer.transformView2World(MouseLocation.vector()));
    } else {
      SerializedDataAdder.addSerializedData(this.copyBoardData, this.copyBoardMouseVector);
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
    SerializedDataAdder.addSerializedData(this.copyBoardData);
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

async function readClipboardItems(mouseLocation: Vector) {
  // test
  try {
    navigator.clipboard.read().then(async (items) => {
      for (const item of items) {
        if (item.types.includes("image/png")) {
          copyEnginePasteImage(item, mouseLocation);
        }
        if (item.types.includes("text/plain")) {
          copyEnginePastePlainText(item, mouseLocation);
        }
      }
    });
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
  }
}
