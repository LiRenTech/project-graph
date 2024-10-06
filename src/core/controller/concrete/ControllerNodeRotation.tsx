import { StageManager } from "../../stage/stageManager/StageManager";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

// region 旋转节点
export const ControllerNodeRotation = new ControllerClass();

ControllerNodeRotation.mousewheel = (event: WheelEvent) => {
  if (Controller.pressingKeySet.has("control")) {
    const location = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    const hoverNode = StageManager.findNodeByLocation(location);
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
  const isHaveEdgeSelected = StageManager.edges.some((edge) => edge.isSelected);
  // 取消选择所有连线
  StageManager.edges.forEach((edge) => {
    edge.isSelected = false;
  });
  if (clickedEdge === null) {
    return;
  }
  ControllerNodeRotation.lastMoveLocation = pressWorldLocation.clone();

  if (isHaveEdgeSelected) {
    Controller.isMovingEdge = true;

    if (clickedEdge.isSelected) {
      // E1
      StageManager.edges.forEach((edge) => {
        edge.isSelected = false;
      });
    } else {
      // E2
      StageManager.edges.forEach((edge) => {
        edge.isSelected = false;
      });
    }
    clickedEdge.isSelected = true;
  } else {
    // F
    clickedEdge.isSelected = true;

    console.log("在连线身上按下");
  }
};

ControllerNodeRotation.mousemove = (event: MouseEvent) => {
  if (Stage.isSelecting || Stage.isCutting) {
    return;
  }
  console.log("在连线身上移动");
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  if (Controller.isMouseDown[0]) {
    const diffLocation = worldLocation.subtract(
      ControllerNodeRotation.lastMoveLocation,
    );
    // 拖拽连线
    Controller.isMovingEdge = true;
    // HACK: 应该加一个条件限制，只能选中一条边，这里有可能会选中多个边
    StageManager.moveEdges(
      ControllerNodeRotation.lastMoveLocation,
      diffLocation,
    );
    ControllerNodeRotation.lastMoveLocation = worldLocation.clone();
  } else if (Controller.isMouseDown[1]) {
  } else if (Controller.isMouseDown[2]) {
  } else {
    // 什么都没有按下的情况
    // 看看鼠标当前的位置是否和线接近
    Stage.hoverEdges = [];
    for (const edge of StageManager.edges) {
      if (
        edge.bodyLine.isPointNearLine(
          worldLocation,
          Controller.edgeHoverTolerance,
        )
      ) {
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
