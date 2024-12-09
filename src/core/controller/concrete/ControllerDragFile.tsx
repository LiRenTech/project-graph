import { Color } from "../../dataStruct/Color";
import { Vector } from "../../dataStruct/Vector";
import { TextRiseEffect } from "../../effect/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../effect/concrete/ViewFlashEffect";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageLoader } from "../../stage/StageLoader";
import { StageManager } from "../../stage/stageManager/StageManager";
import { TextNode } from "../../stageObject/entity/TextNode";
import { ControllerClassDragFile } from "../ControllerClassDragFile";
import { v4 as uuidv4 } from "uuid";
// import { listen } from "@tauri-apps/api/event";

// listen("tauri://file-drop", (event) => {
//   const files = event.payload;
//
// });

/**
 * BUG: 始终无法触发文件拖入事件
 */
export const ControllerDragFile = new ControllerClassDragFile();

/**
 * 处理文件拖入窗口事件
 * @param event
 */
ControllerDragFile.dragEnter = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  Stage.isDraggingFile = true;
  Stage.effects.push(new TextRiseEffect("正在拖入文件"));
  Stage.draggingLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
};

/**
 * 处理文件拖入后 在窗口内**移动**的事件
 * 这个会频繁触发
 * @param event
 */
ControllerDragFile.dragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  Stage.draggingLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
};

/**
 * 处理文件拖入后丢入到窗口内的事件
 * @param event
 * @returns
 */
ControllerDragFile.drop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  const mouseWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );

  const files = event.dataTransfer?.files;

  if (files && files.length > 0) {
    // const firstFile = files[0]; // 获取第一个拖入的文件
    let i = -1;
    for (const file of files) {
      i++;
      if (file.type.includes("json")) {
        dealJsonFileDrop(file, mouseWorldLocation);
      } else if (file.type.includes("text")) {
        dealTxtFileDrop(file, mouseWorldLocation);
      } else {
        dealUnknownFileDrop(file, mouseWorldLocation, i);
      }
    }
  }
  Stage.isDraggingFile = false;
};

ControllerDragFile.dragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  Stage.isDraggingFile = false;
};

function dealUnknownFileDrop(
  file: File,
  mouseWorldLocation: Vector,
  i: number,
) {
  // 未知类型，按插入一个textNode判断
  const textNode = new TextNode({
    uuid: uuidv4(),
    text: file.name,
    location: [mouseWorldLocation.x, mouseWorldLocation.y],
    size: [100, 100],
    color: [0, 0, 0, 0],
  });
  textNode.move(
    new Vector(
      -textNode.rectangle.size.x / 2,
      -textNode.rectangle.size.y / 2 + i * 100,
    ),
  );
  StageManager.addTextNode(textNode);
}

/**
 * 处理json文件拖入窗口并松开的情况
 * @param file
 * @param mouseWorldLocation
 */
function dealJsonFileDrop(file: File, mouseWorldLocation: Vector) {
  const reader = new FileReader();
  reader.readAsText(file); // 以文本格式读取文件内容

  reader.onload = (e) => {
    const fileContent = e.target?.result; // 读取的文件内容

    // 在这里处理读取到的内容
    const dataString = fileContent?.toString();
    if (dataString === undefined) {
      console.error("文件内容为空");
      Stage.effects.push(new TextRiseEffect("文件内容为空"));
    } else {
      StageManager.addSerializedData(
        StageLoader.validate(JSON.parse(dataString)),
        mouseWorldLocation,
      );
      Stage.effects.push(new ViewFlashEffect(Color.White));
    }
  };

  reader.onerror = (e) => {
    console.error("文件读取错误:", e);
    Stage.effects.push(new TextRiseEffect("文件读取错误:" + e));
    Stage.effects.push(new ViewFlashEffect(Color.Red));
  };
}

function dealTxtFileDrop(file: File, mouseWorldLocation: Vector) {
  const reader = new FileReader();
  reader.readAsText(file); // 以文本格式读取文件内容
  reader.onload = (e) => {
    const fileContent = e.target?.result; // 读取的文件内容

    // 在这里处理读取到的内容
    const dataString = fileContent?.toString();
    if (dataString === undefined) {
      console.error("文件内容为空");
      Stage.effects.push(new TextRiseEffect("文件内容为空"));
    } else {
      let yIndex = -1;
      for (const line of dataString.split("\n")) {
        yIndex++;
        const textNode = new TextNode({
          uuid: uuidv4(),
          text: line,
          location: [mouseWorldLocation.x, mouseWorldLocation.y + yIndex * 100],
          size: [100, 100],
          color: [0, 0, 0, 0],
        });
        StageManager.addTextNode(textNode);
      }
      Stage.effects.push(new ViewFlashEffect(Color.White));
    }
  };
  reader.onerror = (e) => {
    console.error("文件读取错误:", e);
    Stage.effects.push(new TextRiseEffect("文件读取错误:" + e));
    Stage.effects.push(new ViewFlashEffect(Color.Red));
  };
}
