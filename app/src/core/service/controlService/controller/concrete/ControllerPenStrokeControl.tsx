import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { LeftMouseModeEnum, Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 所有和笔迹控制特定的逻辑都在这里
 */
export class ControllerPenStrokeControl extends ControllerClass {
  public isAdjusting = false;
  /**
   * Alt键右键按下时的位置
   */
  public startAdjustWidthLocation: Vector = Vector.getZero();
  /**
   * 在右键移动的过程中，记录上一次的位置
   */
  public lastAdjustWidthLocation: Vector = Vector.getZero();

  public mousedown: (event: MouseEvent) => void = (event) => {
    if (!(event.button === 2 && Stage.leftMouseMode === LeftMouseModeEnum.draw)) {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    if (event.button === 2 && Controller.pressingKeySet.has("alt")) {
      // 右键按下时，开始调整笔刷粗细
      this.startAdjustWidthLocation = pressWorldLocation.clone();
      this.isAdjusting = true;
      this.lastAdjustWidthLocation = pressWorldLocation.clone();
    }
  };

  public mousemove: (event: MouseEvent) => void = (event) => {
    if (Stage.leftMouseMode === LeftMouseModeEnum.selectAndMove) {
      // 检查鼠标是否悬浮在笔迹上
      const location = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
      for (const node of StageManager.getPenStrokes()) {
        node.isMouseHover = false;
        if (node.collisionBox.isContainsPoint(location)) {
          node.isMouseHover = true;
        }
      }
    }
    if (Stage.leftMouseMode === LeftMouseModeEnum.draw) {
      if (Controller.pressingKeySet.has("alt") && Controller.isMouseDown[2]) {
        this.onMouseMoveWhenAdjusting(event);
        return;
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public mouseup: (event: MouseEvent) => void = (_event) => {
    if (Stage.leftMouseMode === LeftMouseModeEnum.draw) {
      if (this.isAdjusting) {
        this.isAdjusting = false;
      }
    }
  };

  // public mousewheel: (event: WheelEvent) => void = (event) => {
  //   if (Stage.leftMouseMode !== LeftMouseModeEnum.draw) {
  //     return;
  //   }
  //   if (Controller.pressingKeySet.has("control")) {
  //     // 控制放大缩小
  //     if (isMac) {
  //       // mac暂不支持滚轮缩放大小
  //       return;
  //     } else {
  //       let newWidth;
  //       if (event.deltaY > 0) {
  //         newWidth = Stage.drawingMachine.currentStrokeWidth + 1;
  //       } else {
  //         newWidth = Stage.drawingMachine.currentStrokeWidth - 1;
  //       }
  //       Stage.drawingMachine.currentStrokeWidth = Math.max(1, Math.min(newWidth, 1000));
  //     }
  //   }
  // };

  private onMouseMoveWhenAdjusting = (event: MouseEvent) => {
    // 更改宽度，检测鼠标上下移动的距离（模仿PS的笔刷粗细调整）
    const currentWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));

    // const delta = this.startAdjustWidthLocation.distance(currentWorldLocation);
    let change = 1;
    if (currentWorldLocation.y > this.lastAdjustWidthLocation.y) {
      change *= -1;
    }
    // let delta = this.lastAdjustWidthLocation.distance(currentWorldLocation);
    // // 如果鼠标在往下走，就减小
    // if (currentWorldLocation.y > this.lastAdjustWidthLocation.y) {
    //   delta = -delta;
    // }
    const lastWidth = Stage.drawingMachine.currentStrokeWidth;
    // Stage.effectMachine.addEffect(LineEffect.default(this.startAdjustWidthLocation, worldLocation.clone()));
    const newWidth = Math.round(lastWidth + change);

    // 限制宽度范围
    Stage.drawingMachine.currentStrokeWidth = Math.max(1, Math.min(newWidth, 1000));

    // 记录上一次位置
    this.lastAdjustWidthLocation = currentWorldLocation.clone();
  };
}

export const controllerPenStrokeControl = new ControllerPenStrokeControl();
