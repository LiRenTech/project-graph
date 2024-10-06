import { NodeManager } from "../../NodeManager";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";


export const ControllerNodeMove = new ControllerClass();

ControllerNodeMove.mousedown = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }

  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const isHaveNodeSelected = NodeManager.nodes.some(
    (node) => node.isSelected,
  );
  ControllerNodeMove.lastMoveLocation = pressWorldLocation.clone();
  const clickedNode = NodeManager.findNodeByLocation(pressWorldLocation);
  
  if (clickedNode) {
    Controller.isMovingNode = true;
    if (isHaveNodeSelected) {
      // C
      if (clickedNode.isSelected) {
        // C1
      } else {
        // C2
        NodeManager.nodes.forEach((node) => {
          node.isSelected = false;
        });
      }
      clickedNode.isSelected = true;
    } else {
      // D
      clickedNode.isSelected = true;
    }
  }


};

ControllerNodeMove.mousemove = (event: MouseEvent) => {
  if (Stage.isSelecting || Stage.isCutting) {
    return;
  }
  if (!Controller.isMovingNode) {
    return;
  }
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const diffLocation = worldLocation.subtract(ControllerNodeMove.lastMoveLocation);

  if (NodeManager.nodes.some((node) => node.isSelected)) {
    // 移动节点
    Controller.isMovingNode = true;
    if (Controller.pressingKeySet.has("alt")) {
    } else {
      if (Controller.pressingKeySet.has("control")) {
      } else {
        NodeManager.moveNodes(diffLocation);
      }
    }
    ControllerNodeMove.lastMoveLocation = worldLocation.clone();
  }
  
};

ControllerNodeMove.mouseup = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  if (Controller.isMovingNode) {
    NodeManager.moveNodeFinished();
  }
  Controller.isMovingNode = false;
};
