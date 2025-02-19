import { v4 as uuidv4 } from "uuid";
import { Dialog } from "../../../../components/dialog";
import { Serialized } from "../../../../types/node";
import { writeFileBase64 } from "../../../../utils/fs";
import { PathString } from "../../../../utils/pathString";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Stage } from "../../../stage/Stage";
import { StageDumper } from "../../../stage/StageDumper";
import { StageSerializedAdder } from "../../../stage/stageManager/concreteMethods/StageSerializedAdder";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Entity } from "../../../stage/stageObject/abstract/StageEntity";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../stage/stageObject/entity/UrlNode";
import { MouseLocation } from "../../controlService/MouseLocation";
import { SectionMethods } from "../../../stage/stageManager/basicMethods/SectionMethods";
import { RectanglePushInEffect } from "../../feedbackService/effectEngine/concrete/RectanglePushInEffect";

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
    const entities: Entity[] = [];
    for (const entity of StageManager.getEntities()) {
      if (entity.isSelected) {
        entities.push(entity);
      }
    }

    const serialized = StageDumper.dumpSelected(entities);
    // 更新虚拟剪贴板
    copyBoardData = serialized;
    if (entities.length === 0) {
      // 如果没有选中东西，就是清空虚拟粘贴板
      clearVirtualCopyBoardData();
      return;
    }
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
          // 图片在草稿情况下不能粘贴
          if (Stage.path.isDraft()) {
            Dialog.show({
              title: "草稿状态下不要粘贴图片",
              content: "请先另存为，再粘贴图片，因为粘贴的图片会和保存的工程文件在同一目录下，而草稿在内存中，没有路径",
            });
            return;
          }
          const blob = await item.getType(item.types[0]); // 获取 Blob 对象
          const imageUUID = uuidv4();
          const folder = PathString.dirPath(Stage.path.getFilePath());
          const imagePath = `${folder}${PathString.getSep()}${imageUUID}.png`;

          // 2024.12.31 测试发现这样的写法会导致读取时base64解码失败
          // writeFile(imagePath, new Uint8Array(await blob.arrayBuffer()));
          // 下面这样的写法是没有问题的
          writeFileBase64(imagePath, await convertBlobToBase64(blob));

          // 要延迟一下，等待保存完毕
          setTimeout(() => {
            const imageNode = new ImageNode({
              uuid: imageUUID,
              location: [mouseLocation.x, mouseLocation.y],
              path: `${imageUUID}.png`,
            });
            // imageNode.setBase64StringForced(base64String);
            StageManager.addImageNode(imageNode);
          }, 100);
        }
        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain"); // 获取文本内容
          // const text = await blob.text();
          const text = await blobToText(blob); // 将 Blob 转换为文本
          if (PathString.isValidURL(text)) {
            // 是URL类型
            const urlNode = new UrlNode({
              title: "链接",
              uuid: uuidv4(),
              url: text,
              location: [mouseLocation.x, mouseLocation.y],
            });
            StageManager.addUrlNode(urlNode);

            // 添加到section
            const mouseSections = SectionMethods.getSectionsByInnerLocation(mouseLocation);
            if (mouseSections.length > 0) {
              StageManager.goInSection([urlNode], mouseSections[0]);
              Stage.effectMachine.addEffect(
                RectanglePushInEffect.sectionGoInGoOut(
                  urlNode.collisionBox.getRectangle(),
                  mouseSections[0].collisionBox.getRectangle(),
                ),
              );
            }
          } else {
            // 只是普通的文本
            const textNode = new TextNode({
              uuid: uuidv4(),
              text: text,
              location: [mouseLocation.x, mouseLocation.y],
              size: [100, 100],
              color: [0, 0, 0, 0],
            });
            textNode.move(new Vector(-textNode.rectangle.size.x / 2, -textNode.rectangle.size.y / 2));
            StageManager.addTextNode(textNode);

            // 添加到section
            const mouseSections = SectionMethods.getSectionsByInnerLocation(mouseLocation);
            if (mouseSections.length > 0) {
              StageManager.goInSection([textNode], mouseSections[0]);
              Stage.effectMachine.addEffect(
                RectanglePushInEffect.sectionGoInGoOut(
                  textNode.collisionBox.getRectangle(),
                  mouseSections[0].collisionBox.getRectangle(),
                ),
              );
            }
          }
        }
      }
    });
  } catch (err) {
    console.error("Failed to read clipboard contents: ", err);
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

async function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]); // 去掉"data:image/png;base64,"前缀
      } else {
        reject(new Error("Invalid result type"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
