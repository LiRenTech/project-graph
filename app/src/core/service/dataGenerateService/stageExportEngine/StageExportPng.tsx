import { appScale } from "../../../../utils/platform";
import { sleep } from "../../../../utils/sleep";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { Canvas } from "../../../stage/Canvas";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Settings } from "../../Settings";

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
  let isHaveBackground = true;
  export function setHaveBackground(have: boolean) {
    isHaveBackground = have;
  }
  /**
   * 将整个舞台导出为png图片
   */
  async function exportStage_() {
    // 创建一个新的画布
    const resultCanvas = generateCanvasNode();
    const resultCtx = resultCanvas.getContext("2d")!;
    // 创建完毕

    const stageRect = StageManager.getBoundingRectangle();
    const topLeft = stageRect.leftTop;
    const bottomRight = stageRect.rightBottom;
    // 开始把画布内容渲染到新画布上
    Camera.targetScale = cameraScaleWhenExport;
    Camera.currentScale = cameraScaleWhenExport;
    const viewRect = Renderer.getCoverWorldRectangle();

    const leftTopLocList: { x: number; y: number }[] = [];

    // 遍历xy，xy是切割分块后的目标视野矩形的左上角
    for (let y = topLeft.y; y <= bottomRight.y; y += viewRect.size.y) {
      for (let x = topLeft.x; x <= bottomRight.x; x += viewRect.size.x) {
        leftTopLocList.push({ x, y });
      }
    }
    let i = 0;
    let lastFrame = Renderer.frameIndex;
    while (i < leftTopLocList.length) {
      const { x, y } = leftTopLocList[i];
      // 先移动再暂停等待
      await sleep(2);
      Camera.location = new Vector(x + viewRect.size.x / 2, y + viewRect.size.y / 2);
      await sleep(2);
      if (Renderer.frameIndex - lastFrame < 2) {
        console.log("等待", lastFrame, Renderer.frameIndex, i);
        continue;
      }
      lastFrame = Renderer.frameIndex;
      const imageData = Canvas.ctx.getImageData(0, 0, viewRect.size.x * SCALE, viewRect.size.y * SCALE);
      resultCtx.putImageData(
        imageData,
        (x - topLeft.x) * SCALE * cameraScaleWhenExport,
        (y - topLeft.y) * SCALE * cameraScaleWhenExport,
      );
      tickRenderer(i, leftTopLocList.length);
      i++;
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

  // eslint-disable-next-line prefer-const
  export let startRender = () => {};
  // eslint-disable-next-line prefer-const
  export let finishRender = () => {};
  // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
  export let tickRenderer = (_c: number, _t: number) => {};

  export async function exportStage() {
    startRender();

    // 背景网格信息
    const showBackgroundCartesian = await Settings.get("showBackgroundCartesian");
    Settings.set("showBackgroundCartesian", false);
    const showBackgroundDots = await Settings.get("showBackgroundDots");
    Settings.set("showBackgroundDots", false);
    const showBackgroundHorizontalLines = await Settings.get("showBackgroundHorizontalLines");
    Settings.set("showBackgroundHorizontalLines", false);
    const showBackgroundVerticalLines = await Settings.get("showBackgroundVerticalLines");
    Settings.set("showBackgroundVerticalLines", false);

    // 渲染问题
    const isPauseRenderWhenManipulateOvertime = await Settings.get("isPauseRenderWhenManipulateOvertime");
    Settings.set("isPauseRenderWhenManipulateOvertime", false);
    if (isHaveBackground) {
      Renderer.isRenderBackground = true;
    }
    // 先记录摄像机信息
    const cameraLocation = Camera.location.clone();
    const cameraTargetLocation = Camera.targetLocationByScale.clone();
    const cameraScale = Camera.currentScale;
    // 开始渲染
    await exportStage_();
    Renderer.isRenderBackground = false;
    // 恢复摄像机信息
    Camera.location = cameraLocation;
    Camera.targetLocationByScale = cameraTargetLocation;
    Camera.currentScale = cameraScale;

    // 背景网格信息
    Settings.set("showBackgroundCartesian", showBackgroundCartesian);
    Settings.set("showBackgroundDots", showBackgroundDots);
    Settings.set("showBackgroundHorizontalLines", showBackgroundHorizontalLines);
    Settings.set("showBackgroundVerticalLines", showBackgroundVerticalLines);
    Settings.set("isPauseRenderWhenManipulateOvertime", isPauseRenderWhenManipulateOvertime);

    finishRender();
  }

  export function generateCanvasNode(): HTMLCanvasElement {
    const resultCanvas = document.createElement("canvas");
    resultCanvas.style.position = "fixed";
    resultCanvas.style.top = "50%";
    resultCanvas.style.left = "80%";
    // 暂时看不见这个
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
    imageNode.style.transform = "scale(1)";
    return imageNode;
  }
}
