import { v4 } from "uuid";
import { CursorNameEnum } from "../../../../../types/cursors";
import { Color } from "../../../../dataStruct/Color";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { PenStroke, PenStrokeSegment } from "../../../../stage/stageObject/entity/PenStroke";
import { Settings } from "../../../Settings";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { LeftMouseModeEnum, Stage } from "../../../../stage/Stage";
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
    // 鼠标提示
    Controller.setCursorNameHook(CursorNameEnum.Default);
  }
  public open() {
    this._isUsing = true;
    // 鼠标提示
    Controller.setCursorNameHook(CursorNameEnum.Crosshair);
  }

  private autoFillPenStrokeColorEnable = false;
  private autoFillPenStrokeColor: Color = Color.Transparent;

  /**
   * 当前画笔的粗度
   */
  public currentStrokeWidth = 5;

  /**
   * 初始化函数
   */
  public init(): void {
    super.init();
    Settings.watch("autoFillPenStrokeColorEnable", (value) => {
      this.autoFillPenStrokeColorEnable = value;
    });
    Settings.watch("autoFillPenStrokeColor", (value) => {
      this.autoFillPenStrokeColor = new Color(...value);
    });
  }

  /**
   * 记录笔迹划过位置
   */
  private recordLocation: Vector[] = [];

  public mousedown: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (!(event.button === 0)) {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    if (event.button === 0 && Stage.leftMouseMode === LeftMouseModeEnum.draw) {
      this.recordLocation.push(pressWorldLocation.clone());

      this.lastMoveLocation = pressWorldLocation.clone();

      Controller.setCursorNameHook(CursorNameEnum.Crosshair);
    }
  };

  public mousemove = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (!Controller.isMouseDown[0]) {
      return;
    }
    const worldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    if (Controller.isMouseDown[0] && Stage.leftMouseMode === LeftMouseModeEnum.draw) {
      // 检测：如果移动距离不超过10，则不记录
      if (worldLocation.distance(this.lastMoveLocation) < 5) {
        return;
      }
      this.recordLocation.push(worldLocation.clone());

      // 记录笔刷
      this.currentStroke.push(new PenStrokeSegment(this.lastMoveLocation, worldLocation, this.currentStrokeWidth));
      this.lastMoveLocation = worldLocation.clone();
    }
  };

  public mouseup = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (!(event.button === 0)) {
      return;
    }
    if (event.button === 0 && Stage.leftMouseMode === LeftMouseModeEnum.draw) {
      const releaseWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
      this.recordLocation.push(releaseWorldLocation.clone());

      // 生成笔触
      const strokeStringList: string[] = [];
      for (const location of this.recordLocation) {
        strokeStringList.push(`${Math.round(location.x)},${Math.round(location.y)},${this.currentStrokeWidth}`);
      }
      const contentString = strokeStringList.join("~");

      const stroke = new PenStroke({
        type: "core:pen_stroke",
        content: contentString,
        color: this.getCurrentStrokeColor().toArray(),
        uuid: v4(),
        location: [0, 0],
        details: "",
      });
      stroke.setColor(this.getCurrentStrokeColor());
      StageManager.addPenStroke(stroke);
      this.recordLocation = [];
      this.currentStroke = [];

      Controller.setCursorNameHook(CursorNameEnum.Crosshair);
    }
  };

  public getCurrentStrokeColor() {
    if (this.autoFillPenStrokeColorEnable) {
      return this.autoFillPenStrokeColor;
    } else {
      return Color.Transparent;
    }
  }

  public changeCurrentStrokeColorAlpha(dAlpha: number) {
    if (this.autoFillPenStrokeColorEnable) {
      const newAlpha = Math.max(Math.min(this.autoFillPenStrokeColor.a + dAlpha, 1), 0.01);
      this.autoFillPenStrokeColor = this.autoFillPenStrokeColor.toNewAlpha(newAlpha);
      Settings.set("autoFillPenStrokeColor", this.autoFillPenStrokeColor.toArray());
    }
  }
}

export const ControllerDrawing = new ControllerDrawingClass();
