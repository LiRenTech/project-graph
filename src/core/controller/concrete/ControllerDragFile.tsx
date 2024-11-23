import { Color } from "../../dataStruct/Color";
import { Vector } from "../../dataStruct/Vector";
import { TextRiseEffect } from "../../effect/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../effect/concrete/ViewFlashEffect";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageLoader } from "../../stage/StageLoader";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ControllerClassDragFile } from "../ControllerClassDragFile";
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
 *
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

ControllerDragFile.dragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  Stage.draggingLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
};

ControllerDragFile.drop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  const mouseLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );

  const files = event.dataTransfer?.files;

  if (files && files.length > 0) {
    const file = files[0]; // 获取第一个拖入的文件
    // 检查文件类型是否是json类型
    if (!file.type.includes("json")) {
      console.error("文件类型错误:", file.type);
      Stage.effects.push(new TextRiseEffect("文件类型错误:" + file.type));
      Stage.isDraggingFile = false;
      Stage.effects.push(new ViewFlashEffect(Color.Red));
      return;
    }
    const reader = new FileReader();

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
          mouseLocation,
        );
        Stage.effects.push(new ViewFlashEffect(Color.White));
      }
    };

    reader.onerror = (e) => {
      console.error("文件读取错误:", e);
      Stage.effects.push(new TextRiseEffect("文件读取错误:" + e));
      Stage.effects.push(new ViewFlashEffect(Color.Red));
    };

    reader.readAsText(file); // 以文本格式读取文件内容
  }
  Stage.isDraggingFile = false;
};

ControllerDragFile.dragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  Stage.isDraggingFile = false;
};
