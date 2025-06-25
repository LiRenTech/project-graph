import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { LeftMouseModeEnum, Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { ControllerClass } from "../ControllerClass";
import { getClickedStageObject, isClickedResizeRect } from "./utilsControl";

export let ControllerRectangleSelect: ControllerRectangleSelectClass;

export class ControllerRectangleSelectClass extends ControllerClass {
  private _isUsing: boolean = false;
  /**
   * 框选框
   * 这里必须一开始为null，否则报错，can not asses "Rectangle"
   * 这个框选框是基于世界坐标的。
   * 此变量会根据两个点的位置自动更新。
   */
  public selectingRectangle: Rectangle | null = null;

  constructor(protected readonly project: Project) {
    super(project);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    ControllerRectangleSelect = this;
  }

  public get isUsing() {
    return this._isUsing;
  }

  public shutDown() {
    this.project.rectangleSelect.shutDown();
    this._isUsing = false;
  }

  public mouseMoveOutWindowForcedShutdown(mouseLocation: Vector) {
    super.mouseMoveOutWindowForcedShutdown(mouseLocation);
    this.shutDown();
  }

  public mousedown: (event: MouseEvent) => void = (event) => {
    if (this.project.controller.pressingKeySet.has("alt")) {
      // layer moving mode
      return;
    }
    if (Stage.leftMouseMode !== LeftMouseModeEnum.selectAndMove) {
      return;
    }
    const button = event.button;
    if (button !== 0) {
      return;
    }
    const pressWorldLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));

    if (getClickedStageObject(pressWorldLocation) !== null) {
      // 不是点击在空白处
      return;
    }
    if (isClickedResizeRect(pressWorldLocation)) {
      return;
    }

    this._isUsing = true;

    this.project.rectangleSelect.startSelecting(pressWorldLocation);

    const clickedAssociation = StageManager.findAssociationByLocation(pressWorldLocation);
    if (clickedAssociation !== null) {
      // 在连线身上按下
      this._isUsing = false;
    }
    ControllerRectangleSelect.lastMoveLocation = pressWorldLocation.clone();
  };

  public mousemove: (event: MouseEvent) => void = (event) => {
    if (Stage.leftMouseMode !== LeftMouseModeEnum.selectAndMove) {
      return;
    }
    if (!this._isUsing) {
      return;
    }

    if (!this.project.controller.isMouseDown[0]) {
      return;
    }
    const worldLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));

    this.project.rectangleSelect.moveSelecting(worldLocation);

    ControllerRectangleSelect.lastMoveLocation = worldLocation.clone();
  };

  /**
   * 当前的框选框的方向
   */
  private isSelectDirectionRight = false;
  // 获取此时此刻应该的框选逻辑
  public getSelectMode(): "contain" | "intersect" {
    if (this.isSelectDirectionRight) {
      return Stage.rectangleSelectWhenRight;
    } else {
      return Stage.rectangleSelectWhenLeft;
    }
  }

  public mouseup = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    if (Stage.leftMouseMode !== LeftMouseModeEnum.selectAndMove) {
      return;
    }
    // 左键松开
    this._isUsing = false;

    // 代替
    this.project.rectangleSelect.endSelecting();
  };
}
