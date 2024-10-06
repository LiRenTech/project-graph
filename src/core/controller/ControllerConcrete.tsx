/**
 * 存放具体的控制器实例
 */

import { NodeManager } from "../NodeManager";
import { Renderer } from "../render/canvas2d/renderer";
import { Camera } from "../stage/Camera";
import { Stage } from "../stage/Stage";
import { Vector } from "../Vector";
import { Controller } from "./Controller";
import { ControllerClass } from "./ControllerClass";

// region 摄像机
/**
 * 摄像机控制器
 */
export const ControllerCamera = new ControllerClass();

ControllerCamera.keydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  if (Controller.keyMap[key]) {
    // 当按下某一个方向的时候,相当于朝着某个方向赋予一次加速度
    Camera.accelerateCommander = Camera.accelerateCommander
      .add(Controller.keyMap[key])
      .limitX(-1, 1)
      .limitY(-1, 1);
  }
};

ControllerCamera.keyup = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  if (Controller.keyMap[key]) {
    // 当松开某一个方向的时候,相当于停止加速度
    Camera.accelerateCommander = Camera.accelerateCommander
      .subtract(Controller.keyMap[key])
      .limitX(-1, 1)
      .limitY(-1, 1);
  }
};
function moveCameraByMouseMove(x: number, y: number, mouseIndex: number) {
  const currentMouseMoveLocation = Renderer.transformView2World(
    new Vector(x, y),
  );
  const diffLocation = currentMouseMoveLocation.subtract(
    Controller.lastMousePressLocation[mouseIndex],
  );
  Camera.location = Camera.location.subtract(diffLocation);
}

// ControllerCamera.mousedown = (event: MouseEvent) => {};
ControllerCamera.mousemove = (event: MouseEvent) => {
  if (Controller.pressingKeySet.has(" ") && Controller.isMouseDown[0]) {
    console.log("空格按下的同时按下了鼠标左键");
    moveCameraByMouseMove(event.clientX, event.clientY, 0);
    Controller.setCursorName("grabbing");
    return;
  }
  if (Controller.isMouseDown[1]) {
    moveCameraByMouseMove(event.clientX, event.clientY, 1);
    Controller.setCursorName("grabbing");
  }
};

ControllerCamera.mouseup = (event: MouseEvent) => {
  if (event.button === 1) {
    // 中键松开
    Controller.setCursorName("default");
  }
};
ControllerCamera.mousewheel = (event: WheelEvent) => {
  if (Controller.pressingKeySet.has("control")) {
    return;
  }
  if (event.deltaY > 0) {
    Camera.targetScale *= 0.8;
  } else {
    Camera.targetScale *= 1.2;
  }
};

// region 旋转节点
export const ControllerNodeRotation = new ControllerClass();

ControllerNodeRotation.mousewheel = (event: WheelEvent) => {
  if (Controller.pressingKeySet.has("control")) {
    const location = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    const hoverNode = NodeManager.findNodeByLocation(location);
    if (hoverNode !== null) {
      // 旋转节点
      if (event.deltaY > 0) {
        NodeManager.rotateNode(hoverNode, 10);
      } else {
        NodeManager.rotateNode(hoverNode, -10);
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
  const clickedEdge = NodeManager.findEdgeByLocation(pressWorldLocation);
  const isHaveEdgeSelected = NodeManager.edges.some((edge) => edge.isSelected);
  // 取消选择所有连线
  NodeManager.edges.forEach((edge) => {
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
      NodeManager.edges.forEach((edge) => {
        edge.isSelected = false;
      });
    } else {
      // E2
      NodeManager.edges.forEach((edge) => {
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
    NodeManager.moveEdges(
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
    for (const edge of NodeManager.edges) {
      if (edge.bodyLine.isPointNearLine(worldLocation, Controller.edgeHoverTolerance)) {
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
    NodeManager.moveEdgeFinished();
    Controller.isMovingEdge = false;
  }
};
