import { v4 } from "uuid";
import { sleep } from "../../../../utils/sleep";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { Canvas } from "../../../stage/Canvas";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { StageStyleManager } from "../../feedbackService/stageStyle/StageStyleManager";

export namespace StageExportPng {
  export async function exportStage() {
    const resultCanvas = document.createElement("canvas");
    resultCanvas.style.position = "fixed";
    resultCanvas.style.top = "0";
    resultCanvas.style.left = "0";
    resultCanvas.style.width = "100%";
    resultCanvas.style.height = "100%";
    resultCanvas.style.zIndex = "99999";
    resultCanvas.style.pointerEvents = "none";
    document.body.appendChild(resultCanvas);
    const resultCtx = resultCanvas.getContext("2d")!;
    const stageSize = StageManager.getSize();
    resultCanvas.width = stageSize.x;
    resultCanvas.height = stageSize.y;
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
    window.open(resultCanvas.toDataURL("image/png"), "_blank");
    resultCanvas.remove();
  }
}
