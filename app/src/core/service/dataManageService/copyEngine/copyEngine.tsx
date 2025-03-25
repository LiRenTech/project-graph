import { Serialized } from "../../../../types/node";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { StageDumper } from "../../../stage/StageDumper";
import { StageSerializedAdder } from "../../../stage/stageManager/concreteMethods/StageSerializedAdder";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Entity } from "../../../stage/stageObject/abstract/StageEntity";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { MouseLocation } from "../../controlService/MouseLocation";
import { copyEnginePasteImage } from "./pasteImage";
import { copyEnginePastePlainText } from "./pastePlainText";

/**
 * 专门用来管理节点复制的引擎
 */
export namespace CopyEngine {
  /**
   * 虚拟粘贴板数据
   * 注意：这个不是系统粘贴板
   */
  export let copyBoardData: Serialized.File = {
    version: StageDumper.latestVersion,
    entities: [],
    associations: [],
    tags: [],
  };
  /**
   * 粘贴板内容上的外接矩形
   * 当他为null时，表示没有粘贴板数据
   */

  export let copyBoardDataRectangle: Rectangle | null = null;
  /**
   * 表示从粘贴板外接矩形的矩形中心，到鼠标当前位置的向量
   * 用于计算即将粘贴的位置
   */
  // eslint-disable-next-line prefer-const
  export let copyBoardMouseVector: Vector = Vector.getZero();

  /**
   * 清空虚拟粘贴板
   */
  export function clearVirtualCopyBoardData() {
    copyBoardData = {
      version: StageDumper.latestVersion,
      entities: [],
      associations: [],
      tags: [],
    };
    copyBoardDataRectangle = null;
  }

  /**
   * 用户按下了ctrl+c，
   * 将当前选中的节点复制到虚拟粘贴板
   * 也要将选中的部分复制到系统粘贴板
   */
  export function copy() {
    // 获取所有选中的实体
    const entities: Entity[] = StageManager.getSelectedEntities();
    if (entities.length === 0) {
      // 如果没有选中东西，就是清空虚拟粘贴板
      clearVirtualCopyBoardData();
      return;
    }
    // 更新虚拟剪贴板
    copyBoardData = StageDumper.dumpSelected(entities);

    // 更新虚拟粘贴板形状
    updateRectangle();

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
        systemClipboardItems.push(getImageClipboardItem(entity));
      } else if (entity instanceof TextNode) {
        systemClipboardItems.push(getTextNodeClipboardItem(entity));
      }
    }
    if (systemClipboardItems.length > 0) {
      navigator.clipboard.write(systemClipboardItems);
    }
  }

  function getTextNodeClipboardItem(textNode: TextNode) {
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

  function getImageClipboardItem(entityImage: ImageNode) {
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

  export function isVirtualClipboardEmpty() {
    return copyBoardData.entities.length === 0;
  }

  /**
   * 用户按下了ctrl+v，将粘贴板数据粘贴到画布上
   */
  export function paste() {
    // 如果有虚拟粘贴板数据，则优先粘贴虚拟粘贴板上的东西
    if (isVirtualClipboardEmpty()) {
      readClipboardItems(Renderer.transformView2World(MouseLocation.vector()));
    } else {
      StageSerializedAdder.addSerializedData(copyBoardData, copyBoardMouseVector);
    }
  }

  export function pasteWithOriginLocation() {
    StageSerializedAdder.addSerializedData(copyBoardData);
  }

  function updateRectangle() {
    const rectangles = [];
    for (const node of copyBoardData.entities) {
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
    copyBoardDataRectangle = clipboardRect;
  }
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
