import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { ControllerClass } from "../ControllerClass";

/**
 * 所有和笔迹控制特定的逻辑都在这里
 */
export class ControllerPenStrokeControl extends ControllerClass {
  // 检查鼠标是否悬浮在笔迹上
  public mousemove: (event: MouseEvent) => void = (event) => {
    if (Stage.drawingMachine.isUsing) {
      return;
    }
    const location = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    for (const node of StageManager.getPenStrokes()) {
      node.isMouseHover = false;
      if (node.collisionBox.isContainsPoint(location)) {
        node.isMouseHover = true;
      }
    }
  };
}

export const controllerPenStroke = new ControllerPenStrokeControl();
