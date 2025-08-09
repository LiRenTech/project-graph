import { Dialog } from "@/components/ui/dialog";
import { ControllerClassDragFile } from "@/core/service/controlService/controller/ControllerClassDragFile";
import { CircleChangeRadiusEffect } from "@/core/service/feedbackService/effectEngine/concrete/CircleChangeRadiusEffect";
import { ImageNode } from "@/core/stage/stageObject/entity/ImageNode";
import { TextNode } from "@/core/stage/stageObject/entity/TextNode";
import { Path } from "@/utils/path";
import { PathString } from "@/utils/pathString";
import { Vector } from "@graphif/data-structures";
import { writeFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export class ControllerDragFileClass extends ControllerClassDragFile {
  /**
   * 处理文件拖入窗口事件
   * @param event
   */
  dragEnter = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = true;
    this.draggingLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
  };

  /**
   * 处理文件拖入后 在窗口内**移动**的事件
   * 这个会频繁触发
   * @param event
   */
  dragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.draggingLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
  };

  /**
   * 处理文件拖入后丢入到窗口内的事件
   * @param event
   * @returns
   */
  drop = async () => {
    toast("拖入文件需要改为tauri的api,待实现。。。");
    // TODO: 需要改为tauri的api
    // event.preventDefault();
    // event.stopPropagation();
    // const mouseWorldLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));

    // const files = event.dataTransfer?.files;

    // if (files) {
    //   if (files.length === 0) {
    //     // 在别的浏览器中选中文字并拽到窗口里释放会走这个if分支
    //     await this.dealTempFileDrop(mouseWorldLocation);
    //   }
    //   let i = -1;
    //   for (const file of files) {
    //     i++;
    //     if (file.type.includes("json")) {
    //       await this.dealJsonFileDrop(file, mouseWorldLocation);
    //     } else if (file.type.includes("text")) {
    //       this.readFileText(file).then((dataString) => {
    //         if (file.name.endsWith(".txt")) {
    //           this.project.stageManager.generateNodeTreeByText(dataString, 1, mouseWorldLocation);
    //         } else if (file.name.endsWith(".md")) {
    //           this.project.stageManager.generateNodeByMarkdown(dataString, mouseWorldLocation);
    //         } else {
    //           this.project.stageManager.generateNodeTreeByText(dataString, 1, mouseWorldLocation);
    //         }
    //       });
    //     } else if (file.type.includes("image/svg+xml")) {
    //       this.readFileText(file).then((dataString) => {
    //         const entity = new SvgNode(this.project, {
    //           uuid: uuidv4(),
    //           content: dataString,
    //           location: [mouseWorldLocation.x, mouseWorldLocation.y],
    //           size: [400, 100],
    //         });
    //         this.project.stageManager.add(entity);
    //       });
    //     } else if (file.type.includes("image/png")) {
    //       if (this.project.isDraft) {
    //         // TODO: 文件附件
    //       } else {
    //         await this.dealPngFileDrop(file, mouseWorldLocation);
    //       }
    //     } else {
    //       if (file.name.endsWith(".md")) {
    //         this.readFileText(file).then((dataString) => {
    //           this.project.stageManager.generateNodeByMarkdown(dataString, mouseWorldLocation);
    //         });
    //       }
    //       await this.dealUnknownFileDrop(file, mouseWorldLocation, i);
    //     }
    //   }
    // }
    // this.isDraggingFile = false;
  };

  dragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = false;
  };

  readFileText(file: File): Promise<string> {
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

  async dealTempFileDrop(mouseWorldLocation: Vector) {
    // 未知类型，按插入一个textNode判断
    toast.error("不能直接拖入文字");
    this.project.effects.addEffect(CircleChangeRadiusEffect.fromConnectPointShrink(mouseWorldLocation, 100));
  }

  async dealUnknownFileDrop(file: File, mouseWorldLocation: Vector, i: number) {
    // 未知类型，按插入一个textNode判断
    const textNode = new TextNode(this.project, {
      uuid: uuidv4(),
      text: file.name,
      location: [mouseWorldLocation.x, mouseWorldLocation.y],
      size: [100, 100],
      color: [0, 0, 0, 0],
      details: "unknown file type: " + file.type + "。",
    });
    textNode.move(new Vector(-textNode.rectangle.size.x / 2, -textNode.rectangle.size.y / 2 + i * 100));
    this.project.stageManager.add(textNode);
  }

  /**
   * 处理json文件拖入窗口并松开的情况
   * @param file
   * @param mouseWorldLocation
   */
  async dealJsonFileDrop(file: File, mouseWorldLocation: Vector) {
    // 将鼠标位置整数化
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mouseWorldLocation = new Vector(Math.round(mouseWorldLocation.x), Math.round(mouseWorldLocation.y));

    const reader = new FileReader();
    reader.readAsText(file); // 以文本格式读取文件内容

    reader.onload = (e) => {
      const fileContent = e.target?.result; // 读取的文件内容

      // 在这里处理读取到的内容
      const dataString = fileContent?.toString();
      if (dataString === undefined) {
        toast.error("文件内容为空");
      } else {
        // 检测是否有图片节点
        if (dataString.includes("core:image_node")) {
          // TODO: 文件附件
        }
        Dialog.confirm("将文件内容追加到画布", "即将把拖入的文件内容【追加】到画布，注意不是打开文件！");
      }
    };

    reader.onerror = (e) => {
      throw e;
    };
  }

  async dealPngFileDrop(file: File, mouseWorldLocation: Vector) {
    const imageUUID = uuidv4();
    const folderPath = new Path(this.project.uri).parent.toString();
    await writeFile(`${folderPath}${PathString.getSep()}${imageUUID}.png`, new Uint8Array(await file.arrayBuffer()));
    const imageNode = new ImageNode(this.project, {
      uuid: imageUUID,
      location: [mouseWorldLocation.x, mouseWorldLocation.y],
      path: `${imageUUID}.png`,
    });
    this.project.stageManager.add(imageNode);
  }
}
