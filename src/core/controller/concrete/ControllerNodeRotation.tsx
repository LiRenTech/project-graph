import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 旋转图的节点控制器
 * 鼠标按住Ctrl旋转节点
 * 或者拖拽连线旋转
 */
export const ControllerNodeRotation = new ControllerClass();

ControllerNodeRotation.mousewheel = (event: WheelEvent) => {
  if (Controller.pressingKeySet.has("control")) {
    const location = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    const hoverNode = StageManager.findTextNodeByLocation(location);
    if (hoverNode !== null) {
      // 旋转节点
      if (event.deltaY > 0) {
        StageManager.rotateNode(hoverNode, 10);
      } else {
        StageManager.rotateNode(hoverNode, -10);
      }
    }
  }
};

ControllerNodeRotation.mousedown = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const clickedEdge = StageManager.findEdgeByLocation(pressWorldLocation);
  const isHaveEdgeSelected = StageManager.getEdges().some(
    (edge) => edge.isSelected,
  );
  if (clickedEdge === null) {
    return;
  }
  ControllerNodeRotation.lastMoveLocation = pressWorldLocation.clone();

  if (isHaveEdgeSelected) {
    Controller.isMovingEdge = true;

    if (clickedEdge.isSelected) {
      // E1
      StageManager.getEdges().forEach((edge) => {
        edge.isSelected = false;
      });
    } else {
      // E2
      StageManager.getEdges().forEach((edge) => {
        edge.isSelected = false;
      });
    }
    clickedEdge.isSelected = true;
  } else {
    // F
    clickedEdge.isSelected = true;
  }
};

ControllerNodeRotation.mousemove = (event: MouseEvent) => {
  if (Stage.isSelecting || Stage.isCutting) {
    return;
  }
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  if (Controller.isMouseDown[0]) {
    const diffLocation = worldLocation.subtract(
      ControllerNodeRotation.lastMoveLocation,
    );
    // 拖拽连线
    Controller.isMovingEdge = true;
    StageManager.moveEdges(
      ControllerNodeRotation.lastMoveLocation,
      diffLocation,
    );
    ControllerNodeRotation.lastMoveLocation = worldLocation.clone();
  } else {
    // 什么都没有按下的情况
    // 看看鼠标当前的位置是否和线接近
    Stage.hoverEdges = [];
    for (const edge of StageManager.getEdges()) {
      if (
        edge.target.isHiddenBySectionCollapse &&
        edge.source.isHiddenBySectionCollapse
      ) {
        continue;
      }
      if (edge.collisionBox.isPointInCollisionBox(worldLocation)) {
        Stage.hoverEdges.push(edge);
      }
    }
  }
};

ControllerNodeRotation.mouseup = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  if (Controller.isMovingEdge) {
    StageManager.moveEdgeFinished();
    Controller.isMovingEdge = false;
  }
};
