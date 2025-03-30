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

  public mousedown: (event: MouseEvent) => void = (event) => {
    if (!(event.button === 2 && Stage.leftMouseMode === LeftMouseModeEnum.draw)) {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    if (event.button === 2 && Controller.pressingKeySet.has("alt")) {
      // 右键按下时，开始调整笔刷粗细
      this.startAdjustWidthLocation = pressWorldLocation.clone();
      this.isAdjusting = true;
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

  private onMouseMoveWhenAdjusting = (event: MouseEvent) => {
    // 更改宽度，检测鼠标上下移动的距离（模仿PS的笔刷粗细调整）
    const worldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    const delta = this.startAdjustWidthLocation.distance(worldLocation);
    // Stage.effectMachine.addEffect(LineEffect.default(this.startAdjustWidthLocation, worldLocation.clone()));
    if (delta > 1) {
      Stage.drawingMachine.currentStrokeWidth = Math.min(Math.round(delta * 2), 1000);
    }
  };
}

export const controllerPenStrokeControl = new ControllerPenStrokeControl();
