import { v4 as uuidv4 } from "uuid";
import { writeFileBase64 } from "../../../../../utils/fs";
import { PathString } from "../../../../../utils/pathString";
import { Color } from "../../../../dataStruct/Color";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { StageLoader } from "../../../../stage/StageLoader";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { ImageNode } from "../../../../stage/stageObject/entity/ImageNode";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { TextRiseEffect } from "../../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewFlashEffect } from "../../../feedbackService/effectEngine/concrete/ViewFlashEffect";
import { ControllerClassDragFile } from "../ControllerClassDragFile";
import { Dialog } from "../../../../../components/dialog";

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
  ControllerDragFile.isDraggingFile = true;
  Stage.effectMachine.addEffect(new TextRiseEffect("正在拖入文件"));
  ControllerDragFile.draggingLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
};

/**
 * 处理文件拖入后 在窗口内**移动**的事件
 * 这个会频繁触发
 * @param event
 */
ControllerDragFile.dragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  ControllerDragFile.draggingLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
};

/**
 * 处理文件拖入后丢入到窗口内的事件
 * @param event
 * @returns
 */
ControllerDragFile.drop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  const mouseWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));

  const files = event.dataTransfer?.files;

  if (files) {
    if (files.length === 0) {
      // 在别的浏览器中选中文字并拽到窗口里释放会走这个if分支
      dealTempFileDrop(mouseWorldLocation);
    }
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
        if (Stage.path.isDraft()) {
          Dialog.show({
            title: "提示",
            content: "当前处于草稿状态，请先保存草稿，再拖入图片。",
            type: "warning",
            buttons: [
              { text: "确定" },
              {
                text: "为什么？",
                onClick: () => {
                  Dialog.show({
                    title: "解释",
                    content: "因为草稿没有文件路径，图片是基于相对路径，放在工程文件同一文件夹下存储的",
                    type: "info",
                    buttons: [
                      { text: "好" },
                      {
                        text: "抗议",
                        onClick: () => {
                          Dialog.show({
                            title: "失败",
                            // （？——？）
                            content:
                              "由于我们还没做发送网络请求的后端接口，所以暂时无法直接倾听您的声音，如果需要请在github或QQ群联系我们。",
                            type: "warning",
                          });
                        },
                      },
                    ],
                  });
                },
              },
            ],
          });
        } else {
          dealPngFileDrop(file, mouseWorldLocation);
        }
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
  ControllerDragFile.isDraggingFile = false;
};

ControllerDragFile.dragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  ControllerDragFile.isDraggingFile = false;
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

function dealTempFileDrop(mouseWorldLocation: Vector) {
  // 未知类型，按插入一个textNode判断
  const textNode = new TextNode({
    uuid: uuidv4(),
    text: "拖入文件为空",
    location: [mouseWorldLocation.x, mouseWorldLocation.y],
    size: [100, 100],
    color: [0, 0, 0, 0],
    details: "如果您想拖入文字直接来生成节点，建议先复制，然后直接在舞台上按ctrl+v",
  });
  textNode.move(new Vector(-textNode.rectangle.size.x / 2, -textNode.rectangle.size.y / 2));
  StageManager.addTextNode(textNode);
}

function dealUnknownFileDrop(file: File, mouseWorldLocation: Vector, i: number) {
  // 未知类型，按插入一个textNode判断
  const textNode = new TextNode({
    uuid: uuidv4(),
    text: file.name,
    location: [mouseWorldLocation.x, mouseWorldLocation.y],
    size: [100, 100],
    color: [0, 0, 0, 0],
    details: "unknown file type: " + file.type + "。",
  });
  textNode.move(new Vector(-textNode.rectangle.size.x / 2, -textNode.rectangle.size.y / 2 + i * 100));
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
      StageManager.addSerializedData(StageLoader.validate(JSON.parse(dataString)), mouseWorldLocation);
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
      Stage.effectMachine.addEffect(new TextRiseEffect("图片内容不是string类型"));
      return;
    }

    // 正常情况下，fileContent打印出来是 string类型的东西：
    // data:image/png;base64,iVBORw0KGgoAAAANS...
    // 在这里处理读取到的内容
    const imageUUID = uuidv4();
    const folderPath = PathString.dirPath(Stage.path.getFilePath());
    writeFileBase64(`${folderPath}${PathString.getSep()}${imageUUID}.png`, fileContent.split(",")[1]);
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
