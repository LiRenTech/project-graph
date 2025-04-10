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
import { Camera } from "../../../../stage/Camera";
import { DrawingControllerRenderer } from "../../../../render/canvas2d/controllerRenderer/drawingRenderer";
import { PointDashEffect } from "../../../feedbackService/effectEngine/concrete/PointDashEffect";
/**
 * 涂鸦功能
 */
class ControllerDrawingClass extends ControllerClass {
  private _isUsing: boolean = false;

  /** 在移动的过程中，记录这一笔画的笔迹 */
  public currentStroke: PenStrokeSegment[] = [];

  private autoFillPenStrokeColorEnable = false;
  private autoFillPenStrokeColor: Color = Color.Transparent;

  /**
   * 初始按下的起始点的位置
   */
  public pressStartWordLocation = Vector.getZero();
  /** 当前是否是在绘制直线 */
  public isDrawingLine = false;

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
    if (Stage.leftMouseMode !== LeftMouseModeEnum.draw) {
      return;
    }
    if (!(event.button === 0 && Stage.leftMouseMode === LeftMouseModeEnum.draw)) {
      return;
    }
    this._isUsing = true;

    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    if (Controller.pressingKeySet.has("shift")) {
      this.isDrawingLine = true;
    }
    this.pressStartWordLocation = pressWorldLocation.clone();
    this.recordLocation.push(pressWorldLocation.clone());

    this.lastMoveLocation = pressWorldLocation.clone();

    Controller.setCursorNameHook(CursorNameEnum.Crosshair);
  };

  public mousemove = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (!Controller.isMouseDown[0] && Stage.leftMouseMode === LeftMouseModeEnum.draw) {
      return;
    }
    const worldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    const limitDistance = 2 / Camera.currentScale;
    // 检测：如果移动距离不超过一个距离，则不记录
    if (worldLocation.distance(this.lastMoveLocation) < limitDistance) {
      Stage.effectMachine.addEffect(PointDashEffect.fromMouseEffect(worldLocation, 1));
      return;
    }
    this.recordLocation.push(worldLocation.clone());

    // 记录笔刷
    this.currentStroke.push(new PenStrokeSegment(this.lastMoveLocation, worldLocation, this.currentStrokeWidth));
    this.lastMoveLocation = worldLocation.clone();
  };

  public mouseup = (event: MouseEvent) => {
    if (!this._isUsing) return;
    if (!(event.button === 0 && Stage.leftMouseMode === LeftMouseModeEnum.draw)) {
      return;
    }
    const releaseWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    this.recordLocation.push(releaseWorldLocation.clone());

    // 生成笔触
    if (Controller.pressingKeySet.has("shift")) {
      // 直线
      const startLocation = this.pressStartWordLocation;
      const endLocation = releaseWorldLocation.clone();

      if (Controller.pressingKeySet.has("control")) {
        // 垂直于坐标轴的直线
        const dy = Math.abs(endLocation.y - startLocation.y);
        const dx = Math.abs(endLocation.x - startLocation.x);
        if (dy > dx) {
          // 垂直
          endLocation.x = startLocation.x;
        } else {
          // 水平
          endLocation.y = startLocation.y;
        }
      }

      const strokeStringList: string[] = [
        `${startLocation.x.toFixed(2)},${startLocation.y.toFixed(2)},${this.currentStrokeWidth}`,
        `${endLocation.x.toFixed(2)},${endLocation.y.toFixed(2)},${this.currentStrokeWidth}`,
        `${endLocation.x.toFixed(2)},${endLocation.y.toFixed(2)},${this.currentStrokeWidth}`,
      ];
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
    } else {
      // 普通笔迹
      const strokeStringList: string[] = [];
      for (const location of this.recordLocation) {
        strokeStringList.push(`${location.x.toFixed(2)},${location.y.toFixed(2)},${this.currentStrokeWidth}`);
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
    }

    // 清理
    this.recordLocation = [];
    this.currentStroke = [];

    Controller.setCursorNameHook(CursorNameEnum.Crosshair);
    this._isUsing = false;
    this.isDrawingLine = false;
  };

  public mousewheel: (event: WheelEvent) => void = (event: WheelEvent) => {
    if (!Controller.pressingKeySet.has("shift")) {
      return;
    }
    if (Stage.leftMouseMode !== LeftMouseModeEnum.draw) {
      // 涂鸦模式下才能看到量角器，或者转动量角器
      return;
    }
    if (event.deltaY > 0) {
      DrawingControllerRenderer.rotateUpAngle();
    } else {
      DrawingControllerRenderer.rotateDownAngle();
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
