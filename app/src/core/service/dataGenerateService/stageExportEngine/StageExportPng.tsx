import { v4 } from "uuid";
import { sleep } from "../../../../utils/sleep";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { Canvas } from "../../../stage/Canvas";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { StageStyleManager } from "../../feedbackService/stageStyle/StageStyleManager";
import { appScale } from "../../../../utils/platform";

export namespace StageExportPng {
  /**
   * 将整个舞台导出为png图片
   */
  export async function exportStage() {
    // 创建一个新的画布
    const resultCanvas = generateCanvasNode();
    const resultCtx = resultCanvas.getContext("2d")!;
    const stageSize = StageManager.getSize();
    // 创建完毕

    // 获取到最左上角
    const stageRect = StageManager.getBoundingRectangle();
    const topLeft = stageRect.leftTop;
    const bottomRight = stageRect.rightBottom;
    // 画布背景
    resultCtx.fillStyle = StageStyleManager.currentStyle.Background.toHexString();
    resultCtx.fillRect(0, 0, stageSize.x, stageSize.y);
    // 开始把画布内容渲染到新画布上
    Camera.targetScale = 1;
    Camera.currentScale = 1;
    let i = 0;
    for (let y = topLeft.y; y <= bottomRight.y; y += Renderer.h) {
      for (let x = topLeft.x; x <= bottomRight.x; x += Renderer.w) {
        await sleep(1000);
        StageManager.addTextNode(
          new TextNode({
            uuid: v4(),
            text: i.toString(),
            details: "",
            location: [x, y],
            size: [100, 100],
          }),
        );
        console.log(x, y, x - topLeft.x, y - topLeft.y);
        Camera.location = new Vector(x + Renderer.w / 2, y + Renderer.h / 2);
        const imageData = Canvas.ctx.getImageData(0, 0, Renderer.w, Renderer.h);
        resultCtx.putImageData(imageData, x - topLeft.x, y - topLeft.y);
        i++;
      }
    }
    const imageData = resultCanvas.toDataURL("image/png");
    console.log(imageData);
    // window.open(resultCanvas.toDataURL("image/png"), "_blank");
    // 移除画布
    resultCanvas.remove();

    const imageNode = getImageNodeByImageData(imageData);
    // document.body.appendChild(imageNode);
    const imageBox = document.getElementById("export-png-image-box");
    if (imageBox) {
      imageBox.appendChild(imageNode);
    }
  }

  export function generateCanvasNode(): HTMLCanvasElement {
    const resultCanvas = document.createElement("canvas");
    resultCanvas.style.position = "fixed";
    resultCanvas.style.top = "0";
    resultCanvas.style.left = "0";
    resultCanvas.style.width = "100%";
    resultCanvas.style.height = "100%";
    resultCanvas.style.zIndex = "99999";
    resultCanvas.style.pointerEvents = "none";

    const stageSize = StageManager.getSize();
    // 设置大小
    const scale = window.devicePixelRatio * (1 / appScale);
    resultCanvas.width = stageSize.x * scale;
    resultCanvas.height = stageSize.y * scale;
    resultCanvas.style.width = `${stageSize.x * (1 / appScale)}px`;
    resultCanvas.style.height = `${stageSize.y * (1 / appScale)}px`;
    const ctx = resultCanvas.getContext("2d")!;
    ctx.scale(scale, scale);
    // 设置大小完毕

    document.body.appendChild(resultCanvas);
    return resultCanvas;
  }

  export function getImageNodeByImageData(imageData: string) {
    const imageNode = new Image();
    imageNode.src = imageData;
    imageNode.style.outline = "solid 1px red";
    // imageNode.style.width = "100%";
    // imageNode.style.height = "100%";
    // imageNode.style.pointerEvents = "none";
    return imageNode;
  }
}
