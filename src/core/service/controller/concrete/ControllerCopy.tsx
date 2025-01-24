import { v4 as uuidv4 } from "uuid";
import { Dialog } from "../../../../utils/dialog";
import { writeFileBase64 } from "../../../../utils/fs";
import { PathString } from "../../../../utils/pathString";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Stage } from "../../../stage/Stage";
import { StageDumper } from "../../../stage/StageDumper";
import { StageSerializedAdder } from "../../../stage/stageManager/concreteMethods/StageSerializedAdder";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../../stage/stageObject/entity/UrlNode";
import { Entity } from "../../../stage/stageObject/StageObject";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 关于复制相关的功能
 */
export const ControllerCopy = new ControllerClass();

const validKeys = ["ctrl", "shift", "c", "v", "x", "y", "escape"];

let mouseLocation = new Vector(0, 0);

ControllerCopy.mousemove = (event: MouseEvent) => {
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  mouseLocation = worldLocation.clone();

  // 移动时候
  if (Stage.copyBoardDataRectangle) {
    // 计算鼠标位置的偏移量

    const offset = new Vector(
      worldLocation.x - Stage.copyBoardDataRectangle.center.x,
      worldLocation.y - Stage.copyBoardDataRectangle.center.y,
    );
    Stage.copyBoardMouseVector = offset;
  }
};
ControllerCopy.keydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  // 首先判断是否是合法的按键
  if (!validKeys.includes(key)) return;
  if (key === "escape") {
    // 取消复制
    Stage.copyBoardData = StageDumper.dumpSelected([]);
    Stage.copyBoardDataRectangle = null;
    return;
  }
  if (key === "c" && Controller.pressingKeySet.has("control")) {
    // 复制
    const entities: Entity[] = [];
    for (const entity of StageManager.getEntities()) {
      if (entity.isSelected) {
        entities.push(entity);
      }
    }

    const serialized = StageDumper.dumpSelected(entities);
    // 复制到剪贴板
    Stage.copyBoardData = serialized;
    if (entities.length === 0) {
      // 如果没有选中东西
      Stage.copyBoardDataRectangle = null;
    } else {
      // 复制的那一刹那，还要记录一下整个外接矩形
      const rectangles = [];
      for (const node of Stage.copyBoardData.entities) {
        if (node.type === "core:connect_point") {
          rectangles.push(
            new Rectangle(new Vector(...node.location), new Vector(1, 1)),
          );
        } else {
          rectangles.push(
            new Rectangle(
              new Vector(...node.location),
              new Vector(...node.size),
            ),
          );
        }
      }

      const clipboardRect = Rectangle.getBoundingRectangle(rectangles);
      Stage.copyBoardDataRectangle = clipboardRect;
    }
  } else if (key === "v" && Controller.pressingKeySet.has("control")) {
    // 粘贴
    if (Stage.copyBoardData.entities.length === 0) {
      readClipboardItems(mouseLocation);
    } else {
      if (Controller.pressingKeySet.has("shift")) {
        // 原位置粘贴
        StageSerializedAdder.addSerializedData(Stage.copyBoardData);
      } else {
        // 鼠标位置粘贴
        StageSerializedAdder.addSerializedData(
          Stage.copyBoardData,
          Stage.copyBoardMouseVector,
        );
      }
    }
  }
};

async function readClipboardItems(mouseLocation: Vector) {
  // test
  try {
    navigator.clipboard.read().then(async (items) => {
      for (const item of items) {
        if (item.types.includes("image/png")) {
          // 图片在草稿情况下不能粘贴
          if (Stage.Path.isDraft()) {
            Dialog.show({
              title: "草稿状态下不要粘贴图片",
              content:
                "请先另存为，再粘贴图片，因为粘贴的图片会和保存的工程文件在同一目录下，而草稿在内存中，没有路径",
            });
            return;
          }
          const blob = await item.getType(item.types[0]); // 获取 Blob 对象
          const imageUUID = uuidv4();
          const folder = PathString.dirPath(Stage.Path.getFilePath());
          const imagePath = `${folder}${Stage.Path.getSep()}${imageUUID}.png`;

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
          } else {
            // 只是普通的文本
            const textNode = new TextNode({
              uuid: uuidv4(),
              text: text,
              location: [mouseLocation.x, mouseLocation.y],
              size: [100, 100],
              color: [0, 0, 0, 0],
            });
            textNode.move(
              new Vector(
                -textNode.rectangle.size.x / 2,
                -textNode.rectangle.size.y / 2,
              ),
            );
            StageManager.addTextNode(textNode);
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
