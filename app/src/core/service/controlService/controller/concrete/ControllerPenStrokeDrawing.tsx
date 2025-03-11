import { Color } from "../../../../dataStruct/Color";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { PenStroke, PenStrokeSegment } from "../../../../stage/stageObject/entity/PenStroke";
import { Settings } from "../../../Settings";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 涂鸦功能
 */
class ControllerDrawingClass extends ControllerClass {
  // 一开始是禁用状态
  private _isUsing: boolean = false;

  public currentStroke: PenStrokeSegment[] = [];

  public get isUsing() {
    return this._isUsing;
  }
  public shutDown() {
    this._isUsing = false;
    this.currentStroke = [];
  }
  public open() {
    this._isUsing = true;
  }

  /**
   * 记录笔迹划过位置
   */
  private recordLocation: Vector[] = [];

  public mousedown: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (event.button !== 0) {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));

    this.recordLocation.push(pressWorldLocation.clone());

    this.lastMoveLocation = pressWorldLocation.clone();
  };

  public mousemove = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (!Controller.isMouseDown[0]) {
      return;
    }
    const worldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    // 检测：如果移动距离不超过10，则不记录
    if (worldLocation.distance(this.lastMoveLocation) < 5) {
      return;
    }
    this.recordLocation.push(worldLocation.clone());

    // 记录笔刷
    this.currentStroke.push(new PenStrokeSegment(this.lastMoveLocation, worldLocation, 5));
    this.lastMoveLocation = worldLocation.clone();
  };

  public mouseup = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (event.button !== 0) {
      return;
    }
    const releaseWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    this.recordLocation.push(releaseWorldLocation.clone());

    // 生成笔触
    const strokeStringList: string[] = [];
    for (const location of this.recordLocation) {
      strokeStringList.push(`${Math.round(location.x)},${Math.round(location.y)},5`);
    }
    const contentString = strokeStringList.join("~");

    const stroke = new PenStroke(contentString);
    this.autoSetByPenStroke(stroke);
    StageManager.addPenStroke(stroke);
    this.recordLocation = [];
    this.currentStroke = [];
  };

  async autoSetByPenStroke(penStroke: PenStroke) {
    if (await Settings.get("autoFillPenStrokeColorEnable")) {
      const autoColor = await Settings.get("autoFillPenStrokeColor");
      penStroke.setColor(new Color(...autoColor));
    }
  }
}

export const ControllerDrawing = new ControllerDrawingClass();
