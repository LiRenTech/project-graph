import { sleep } from "../../../../utils/sleep";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { Canvas } from "../../../stage/Canvas";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { StageStyleManager } from "../../feedbackService/stageStyle/StageStyleManager";
import { appScale } from "../../../../utils/platform";

export namespace StageExportPng {
  /**
   * 系统缩放因子
   */
  const SCALE = window.devicePixelRatio * (1 / appScale);

  /**
   * 导出时，相机缩放因子
   */
  let cameraScaleWhenExport = 0.5;

  export function changeCameraScaleWhenExport(scale: number) {
    cameraScaleWhenExport = scale;
  }

  /**
   * 是否有背景
   */
  export const isHaveBackground = true;

  /**
   * 将整个舞台导出为png图片
   */
  export async function exportStage() {
    // 创建一个新的画布
    const resultCanvas = generateCanvasNode();
    const resultCtx = resultCanvas.getContext("2d")!;
    // 创建完毕

    const stageRect = StageManager.getBoundingRectangle();
    const topLeft = stageRect.leftTop;
    const bottomRight = stageRect.rightBottom;
    // 画布背景
    if (isHaveBackground) {
      resultCtx.fillStyle = StageStyleManager.currentStyle.Background.toNewAlpha(1).toString();
      resultCtx.fillRect(0, 0, stageRect.size.x, stageRect.size.y);
    }
    // 开始把画布内容渲染到新画布上
    Camera.targetScale = cameraScaleWhenExport;
    Camera.currentScale = cameraScaleWhenExport;
    const viewRect = Renderer.getCoverWorldRectangle();

    // 遍历xy，xy是切割分块后的目标视野矩形的左上角
    for (let y = topLeft.y; y <= bottomRight.y; y += viewRect.size.y) {
      for (let x = topLeft.x; x <= bottomRight.x; x += viewRect.size.x) {
        // 先移动再暂停等待
        await sleep(200);
        Camera.location = new Vector(x + viewRect.size.x / 2, y + viewRect.size.y / 2);
        await sleep(200);
        const imageData = Canvas.ctx.getImageData(0, 0, viewRect.size.x * SCALE, viewRect.size.y * SCALE);
        resultCtx.putImageData(
          imageData,
          (x - topLeft.x) * SCALE * cameraScaleWhenExport,
          (y - topLeft.y) * SCALE * cameraScaleWhenExport,
        );
      }
    }
    const imageData = resultCanvas.toDataURL("image/png");
    // 移除画布
    resultCanvas.remove();

    const imageNode = getImageNodeByImageData(imageData);
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
    resultCanvas.width = stageSize.x * SCALE * cameraScaleWhenExport;
    resultCanvas.height = stageSize.y * SCALE * cameraScaleWhenExport;
    resultCanvas.style.width = `${stageSize.x * (1 / appScale) * cameraScaleWhenExport}px`;
    resultCanvas.style.height = `${stageSize.y * (1 / appScale) * cameraScaleWhenExport}px`;
    const ctx = resultCanvas.getContext("2d")!;
    ctx.scale(SCALE, SCALE);
    // 设置大小完毕

    document.body.appendChild(resultCanvas);
    return resultCanvas;
  }

  export function getImageNodeByImageData(imageData: string) {
    const imageNode = new Image();
    imageNode.src = imageData;
    imageNode.style.outline = "solid 1px red";
    imageNode.style.margin = "10px";
    return imageNode;
  }
}
