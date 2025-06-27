import { appScale } from "../../../../utils/platform";
import { sleep } from "../../../../utils/sleep";
import { Vector } from "../../../dataStruct/Vector";
import { Project, service } from "../../../Project";
import { Settings } from "../../Settings";

@service("stageExportPng")
export class StageExportPng {
  constructor(private readonly project: Project) {}

  /**
   * 系统缩放因子
   */
  static SCALE = window.devicePixelRatio * (1 / appScale);

  /**
   * 导出时，相机缩放因子
   */
  private cameraScaleWhenExport = 0.5;

  static PADDING = 100;

  changeCameraScaleWhenExport(scale: number) {
    this.cameraScaleWhenExport = scale;
  }

  /**
   * 是否有背景
   */
  private isHaveBackground = false;
  setHaveBackground(have: boolean) {
    this.isHaveBackground = have;
  }
  /**
   * 将整个舞台导出为png图片
   */
  private async exportStage_() {
    // 创建一个新的画布
    const resultCanvas = this.generateCanvasNode();
    const resultCtx = resultCanvas.getContext("2d")!;
    // 创建完毕

    const stageRect = this.project.stageManager.getBoundingRectangle();
    const topLeft = stageRect.leftTop.subtract(new Vector(StageExportPng.PADDING, StageExportPng.PADDING));
    const bottomRight = stageRect.rightBottom.add(new Vector(StageExportPng.PADDING, StageExportPng.PADDING));
    // 开始把画布内容渲染到新画布上
    this.project.camera.targetScale = this.cameraScaleWhenExport;
    this.project.camera.currentScale = this.cameraScaleWhenExport;
    const viewRect = this.project.renderer.getCoverWorldRectangle();

    const leftTopLocList: { x: number; y: number }[] = [];

    // 遍历xy，xy是切割分块后的目标视野矩形的左上角
    for (let y = topLeft.y; y <= bottomRight.y; y += viewRect.size.y) {
      for (let x = topLeft.x; x <= bottomRight.x; x += viewRect.size.x) {
        leftTopLocList.push({ x, y });
      }
    }
    let i = 0;
    let lastFrame = this.project.renderer.frameIndex;
    while (i < leftTopLocList.length) {
      const { x, y } = leftTopLocList[i];
      // 先移动再暂停等待
      await sleep(2);
      this.project.camera.location = new Vector(x + viewRect.size.x / 2, y + viewRect.size.y / 2);
      await sleep(2);
      if (this.project.renderer.frameIndex - lastFrame < 2) {
        console.log("等待", lastFrame, this.project.renderer.frameIndex, i);
        continue;
      }
      lastFrame = this.project.renderer.frameIndex;
      const imageData = this.project.canvas.ctx.getImageData(
        0,
        0,
        viewRect.size.x * StageExportPng.SCALE,
        viewRect.size.y * StageExportPng.SCALE,
      );
      resultCtx.putImageData(
        imageData,
        (x - topLeft.x) * StageExportPng.SCALE * this.cameraScaleWhenExport,
        (y - topLeft.y) * StageExportPng.SCALE * this.cameraScaleWhenExport,
      );
      this.tickRenderer(i, leftTopLocList.length);
      i++;
    }
    const imageData = resultCanvas.toDataURL("image/png");
    // 移除画布
    resultCanvas.remove();

    const imageNode = this.getImageNodeByImageData(imageData);
    const imageBox = document.getElementById("export-png-image-box");
    if (imageBox) {
      imageBox.appendChild(imageNode);
    }
  }

  startRender = () => {};

  finishRender = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tickRenderer = (_c: number, _t: number) => {};

  async exportStage() {
    this.startRender();

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
    if (this.isHaveBackground) {
      this.project.renderer.isRenderBackground = true;
    }
    // 先记录摄像机信息
    const cameraLocation = this.project.camera.location.clone();
    const cameraTargetLocation = this.project.camera.targetLocationByScale.clone();
    const cameraScale = this.project.camera.currentScale;
    // 开始渲染
    await this.exportStage_();
    this.project.renderer.isRenderBackground = false;
    // 恢复摄像机信息
    this.project.camera.location = cameraLocation;
    this.project.camera.targetLocationByScale = cameraTargetLocation;
    this.project.camera.currentScale = cameraScale;

    // 背景网格信息
    Settings.set("showBackgroundCartesian", showBackgroundCartesian);
    Settings.set("showBackgroundDots", showBackgroundDots);
    Settings.set("showBackgroundHorizontalLines", showBackgroundHorizontalLines);
    Settings.set("showBackgroundVerticalLines", showBackgroundVerticalLines);
    Settings.set("isPauseRenderWhenManipulateOvertime", isPauseRenderWhenManipulateOvertime);

    this.finishRender();
  }

  generateCanvasNode(): HTMLCanvasElement {
    const resultCanvas = document.createElement("canvas");
    resultCanvas.style.position = "fixed";
    resultCanvas.style.top = "50%";
    resultCanvas.style.left = "80%";
    // 暂时看不见这个
    resultCanvas.style.zIndex = "99999";
    resultCanvas.style.pointerEvents = "none";

    const stageSize = this.project.stageManager
      .getSize()
      .add(new Vector(StageExportPng.PADDING * 2, StageExportPng.PADDING * 2));
    // 设置大小
    resultCanvas.width = stageSize.x * StageExportPng.SCALE * this.cameraScaleWhenExport;
    resultCanvas.height = stageSize.y * StageExportPng.SCALE * this.cameraScaleWhenExport;
    resultCanvas.style.width = `${stageSize.x * (1 / appScale) * this.cameraScaleWhenExport}px`;
    resultCanvas.style.height = `${stageSize.y * (1 / appScale) * this.cameraScaleWhenExport}px`;
    const ctx = resultCanvas.getContext("2d")!;
    ctx.scale(StageExportPng.SCALE, StageExportPng.SCALE);
    // 设置大小完毕

    document.body.appendChild(resultCanvas);
    return resultCanvas;
  }

  getImageNodeByImageData(imageData: string) {
    const imageNode = new Image();
    imageNode.src = imageData;
    imageNode.style.outline = "solid 1px red";
    imageNode.style.margin = "10px";
    imageNode.style.transform = "scale(1)";
    return imageNode;
  }
}
