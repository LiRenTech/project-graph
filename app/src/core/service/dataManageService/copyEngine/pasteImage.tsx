import { v4 as uuidv4 } from "uuid";
import { Dialog } from "../../../../components/dialog";
import { writeFileBase64 } from "../../../../utils/fs";
import { PathString } from "../../../../utils/pathString";
import { Vector } from "../../../dataStruct/Vector";
import { Stage } from "../../../stage/Stage";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { Settings } from "../../Settings";

/**
 * 把粘贴板中的PNG图片读取并写入到磁盘和舞台上
 * 此函数在调用时，上游已确认 clipboardItem 的类型是 image/png
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

  const imageFileName = getImageName(imageUUID);
  const imagePath = `${folder}${PathString.getSep()}${imageFileName}.png`;

  // 2024.12.31 测试发现这样的写法会导致读取时base64解码失败
  // writeFile(imagePath, new Uint8Array(await blob.arrayBuffer()));
  // 下面这样的写法是没有问题的
  const compressPastedImages = await Settings.get("compressPastedImages");
  const maxPastedImageSize = await Settings.get("maxPastedImageSize");

  writeFileBase64(imagePath, await convertBlobToBase64(blob, compressPastedImages, maxPastedImageSize));

  // 要延迟一下，等待保存完毕
  setTimeout(() => {
    const imageNode = new ImageNode({
      uuid: imageUUID,
      location: [mouseLocation.x, mouseLocation.y],
      path: `${imageFileName}.png`,
    });
    this.project.stageManager.addImageNode(imageNode);
  }, 100);
}

/**
 * 根据uuid和时间生成图片文件名
 * 防止有人感觉图片全是uuid感觉很混乱
 */
function getImageName(uuid: string): string {
  const currentFileName = PathString.getFileNameFromPath(Stage.path.getFilePath());
  const shortedFileName = PathString.getShortedFileName(currentFileName, 6);
  // 获取当前日期时间，格式：“YY-MM-DD-HH-mm-ss”
  const currentDateTime = new Date().toISOString().replace(/:/g, "-").slice(0, 19);
  const imageFileName = `${shortedFileName}-${currentDateTime}-${uuid.slice(0, 4)}`;
  return imageFileName;
}

async function convertBlobToBase64(blob: Blob, isCompressOpen = true, maxSize = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === "string") {
        if (!isCompressOpen) {
          resolve(reader.result.split(",")[1]);
        } else {
          // 创建Image对象来获取原始尺寸
          const img = new Image();
          img.src = reader.result;

          await new Promise((resolve) => {
            img.onload = resolve;
          });

          // 创建canvas进行压缩
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          // 设置压缩后最大尺寸为1920px
          // const maxSize = 3840;
          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          // 绘制压缩后的图片，质量设为0.8
          ctx.drawImage(img, 0, 0, width, height);

          // 转换为压缩后的base64
          canvas.toBlob(
            (compressedBlob) => {
              if (!compressedBlob) {
                reject(new Error("Compression failed"));
                return;
              }

              const compressedReader = new FileReader();
              compressedReader.onloadend = () => {
                if (typeof compressedReader.result === "string") {
                  resolve(compressedReader.result.split(",")[1]);
                } else {
                  reject(new Error("Invalid result type"));
                }
              };
              compressedReader.onerror = reject;
              compressedReader.readAsDataURL(compressedBlob);
            },
            "image/png",
            0.8, // 压缩质量，0-1之间，仅对 jpeg 有用
          );
        }
      } else {
        reject(new Error("Invalid result type"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
