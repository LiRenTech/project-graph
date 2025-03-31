import { Dialog } from "../../../../components/dialog";
import { writeFileBase64 } from "../../../../utils/fs";
import { PathString } from "../../../../utils/pathString";
import { Vector } from "../../../dataStruct/Vector";
import { Stage } from "../../../stage/Stage";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { v4 as uuidv4 } from "uuid";

/**
 * 把粘贴板中的PNG图片读取并写入到磁盘和舞台上
 * @param item
 * @param mouseLocation
 * @returns
 */
export async function copyEnginePasteImage(item: ClipboardItem, mouseLocation: Vector) {
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

  // 防止有人感觉图片全是uuid感觉很混乱。
  const currentFileName = PathString.getFileNameFromPath(Stage.path.getFilePath());
  const shortedFileName = PathString.getShortedFileName(currentFileName, 6);
  // 获取当前日期时间，格式：“YY-MM-DD-HH-mm-ss”
  const currentDateTime = new Date().toISOString().replace(/:/g, "-").slice(0, 19);
  const imageFileName = `${shortedFileName}-${currentDateTime}-${imageUUID.slice(0, 4)}`;
  // const imageFileName: string = imageUUID;
  const imagePath = `${folder}${PathString.getSep()}${imageFileName}.png`;

  // 2024.12.31 测试发现这样的写法会导致读取时base64解码失败
  // writeFile(imagePath, new Uint8Array(await blob.arrayBuffer()));
  // 下面这样的写法是没有问题的
  writeFileBase64(imagePath, await convertBlobToBase64(blob));

  // 要延迟一下，等待保存完毕
  setTimeout(() => {
    const imageNode = new ImageNode({
      uuid: imageUUID,
      location: [mouseLocation.x, mouseLocation.y],
      path: `${imageFileName}.png`,
    });
    // imageNode.setBase64StringForced(base64String);
    StageManager.addImageNode(imageNode);
  }, 100);
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
