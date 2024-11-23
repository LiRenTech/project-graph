import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { editNode, editNodeDetails } from "./utilsControl";

/**
 * 包含编辑节点文字，编辑详细信息等功能的控制器
 *
 * 当有节点编辑时，会把摄像机锁定住
 */
export const ControllerNodeEdit = new ControllerClass();

ControllerNodeEdit.mouseDoubleClick = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }

  const pressLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const clickedNode = StageManager.findTextNodeByLocation(pressLocation);
  if (clickedNode === null) {
    return;
  }

  if (Controller.pressingKeySet.has("control")) {
    editNodeDetails(clickedNode);
  } else {
    editNode(clickedNode);
  }
};

ControllerNodeEdit.mousemove = (event: MouseEvent) => {
  /**
   * 如果一直显示详细信息，则不显示鼠标悬停效果
   */
  if (Renderer.isAlwaysShowDetails) {
    return;
  }

  const location = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  for (const node of StageManager.getTextNodes()) {
    node.isMouseHover = false;
    if (node.collisionBox.isPointInCollisionBox(location)) {
      node.isMouseHover = true;
    }
  }
};
