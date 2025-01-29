import { v4 as uuidv4 } from "uuid";
import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Stage } from "../../../stage/Stage";
import { StageLoader } from "../../../stage/StageLoader";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { TextRiseEffect } from "../../effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../effectEngine/concrete/ViewFlashEffect";
import { ControllerClassDragFile } from "../ControllerClassDragFile";
import { VFileSystem } from "../../VFileSystem";
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
  Stage.effectMachine.addEffect(new TextRiseEffect("正在拖入文件"));
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
        readFileText(file).then((dataString) => {
          if (file.name.endsWith(".txt")) {
            StageManager.generateNodeByText(dataString, 1, mouseWorldLocation);
          } else if (file.name.endsWith(".md")) {
            StageManager.generateNodeByMarkdown(dataString, mouseWorldLocation);
          } else {
            StageManager.generateNodeByText(dataString, 1, mouseWorldLocation);
          }
        });
      } else if (file.type.includes("image/png")) {
        dealPngFileDrop(file, mouseWorldLocation);
      } else {
        if (file.name.endsWith(".md")) {
          readFileText(file).then((dataString) => {
            StageManager.generateNodeByMarkdown(dataString, mouseWorldLocation);
          });
        }
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

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file); // 以文本格式读取文件内容
    reader.onload = (e) => {
      const fileContent = e.target?.result; // 读取的文件内容
      if (typeof fileContent === "string") {
        resolve(fileContent);
      } else {
        reject("文件内容不是string类型");
      }
    };
    reader.onerror = (e) => {
      reject("文件读取错误:" + e);
    };
  });
}

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
    details: "unknown file type: " + file.type + "。",
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
      Stage.effectMachine.addEffect(new TextRiseEffect("文件内容为空"));
    } else {
      StageManager.addSerializedData(
        StageLoader.validate(JSON.parse(dataString)),
        mouseWorldLocation,
      );
      Stage.effectMachine.addEffect(new ViewFlashEffect(Color.White));
    }
  };

  reader.onerror = (e) => {
    console.error("文件读取错误:", e);
    Stage.effectMachine.addEffect(new TextRiseEffect("文件读取错误:" + e));
    Stage.effectMachine.addEffect(new ViewFlashEffect(Color.Red));
  };
}

function dealPngFileDrop(file: File, mouseWorldLocation: Vector) {
  const reader = new FileReader();
  reader.readAsDataURL(file); // 以文本格式读取文件内容
  reader.onload = (e) => {
    const fileContent = e.target?.result; // 读取的文件内容

    if (typeof fileContent !== "string") {
      console.error("文件内容为空");
      Stage.effectMachine.addEffect(
        new TextRiseEffect("图片内容不是string类型"),
      );
      return;
    }

    // 正常情况下，fileContent打印出来是 string类型的东西：
    // data:image/png;base64,iVBORw0KGgoAAAANS...
    // 在这里处理读取到的内容
    const imageUUID = uuidv4();
    VFileSystem.getFS().writeFileBase64(
      `/picture/${imageUUID}.png`,
      fileContent.split(",")[1],
    );
    const imageNode = new ImageNode({
      uuid: imageUUID,
      location: [mouseWorldLocation.x, mouseWorldLocation.y],
      path: `${imageUUID}.png`,
    });
    StageManager.addImageNode(imageNode);
  };
  reader.onerror = (e) => {
    console.error("文件读取错误:", e);
    Stage.effectMachine.addEffect(new TextRiseEffect("文件读取错误:" + e));
    Stage.effectMachine.addEffect(new ViewFlashEffect(Color.Red));
  };
}
