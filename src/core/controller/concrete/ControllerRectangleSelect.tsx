import { StageManager } from "../../stage/stageManager/StageManager";
import { Rectangle } from "../../dataStruct/Rectangle";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 框选控制器
 */
export const ControllerRectangleSelect = new ControllerClass();

ControllerRectangleSelect.mousedown = (event: MouseEvent) => {
  const button = event.button;
  if (button !== 0) {
    return;
  }
  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const clickedNode = StageManager.findNodeByLocation(pressWorldLocation);
  const clickedEdge = StageManager.findEdgeByLocation(pressWorldLocation);
  if (clickedNode !== null || clickedEdge !== null) {
    // 在空白地方按下，才能触发框选
    return;
  }
  const isHaveNodeSelected = StageManager.nodes.some((node) => node.isSelected);
  const isHaveEdgeSelected = StageManager.edges.some((edge) => edge.isSelected);
  console.log(isHaveNodeSelected, isHaveEdgeSelected);
  // 现在的情况：在空白的地方按下左键

  if (isHaveNodeSelected || isHaveEdgeSelected) {
    // A
    if (
      Controller.pressingKeySet.has("shift") ||
      Controller.pressingKeySet.has("control")
    ) {
      // 不取消选择
      console.log("A");
    } else {
      // 取消选择所有节点
      StageManager.nodes.forEach((node) => {
        node.isSelected = false;
      });
      // 取消选择所有边
      StageManager.edges.forEach((edge) => {
        edge.isSelected = false;
      });
      console.log("取消选择所有节点和边");
    }
  }
  Stage.isSelecting = true;
  Stage.selectStartLocation = pressWorldLocation.clone();
  Stage.selectEndLocation = pressWorldLocation.clone();
  Stage.selectingRectangle = new Rectangle(
    pressWorldLocation.clone(),
    Vector.getZero(),
  );

  if (clickedEdge === null) {
    // 和A一样了
  } else {
    // 在连线身上按下
    Stage.isSelecting = false;
  }
  ControllerRectangleSelect.lastMoveLocation = pressWorldLocation.clone();
};

ControllerRectangleSelect.mousemove = (event: MouseEvent) => {
  if (!Stage.isSelecting) {
    return;
  }
  if (!Controller.isMouseDown[0]) {
    return;
  }
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  // 正在框选
  Stage.selectEndLocation = worldLocation.clone();

  Stage.selectingRectangle = Rectangle.fromTwoPoints(
    Stage.selectStartLocation,
    Stage.selectEndLocation,
  );

  if (
    Controller.pressingKeySet.has("shift") ||
    Controller.pressingKeySet.has("control")
  ) {
    // 移动过程中不先暴力清除
  } else {
    // 先清空所有已经选择了的
    StageManager.nodes.forEach((node) => {
      node.isSelected = false;
    });
    StageManager.edges.forEach((edge) => {
      edge.isSelected = false;
    });
  }

  if (Controller.pressingKeySet.has("control")) {
    // 交叉选择，没的变有，有的变没
    for (const node of StageManager.nodes) {
      if (Stage.selectingRectangle.isCollideWith(node.rectangle)) {
        if (Controller.lastSelectedNode.has(node.uuid)) {
          node.isSelected = false;
        } else {
          node.isSelected = true;
        }
      }
    }
    for (const edge of StageManager.edges) {
      if (Stage.selectingRectangle.isCollideWithLine(edge.bodyLine)) {
        if (
          Controller.lastSelectedEdge.has(
            edge.target.uuid + "&" + edge.source.uuid,
          )
        ) {
          edge.isSelected = false;
        } else {
          edge.isSelected = true;
        }
      }
    }
  } else {
    let isHaveNode = false;
    for (const node of StageManager.nodes) {
      if (Stage.selectingRectangle.isCollideWith(node.rectangle)) {
        node.isSelected = true;
        isHaveNode = true;
      }
    }
    if (!isHaveNode) {
      // 如果已经有节点被选择了，则不能再选择边了
      for (const edge of StageManager.edges) {
        if (Stage.selectingRectangle.isCollideWithLine(edge.bodyLine)) {
          edge.isSelected = true;
        }
      }
    }
  }
  Controller.isMovingNode = false;
  Controller.isMovingEdge = false;
  ControllerRectangleSelect.lastMoveLocation = worldLocation.clone();
};

ControllerRectangleSelect.mouseup = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  // 左键松开
  Stage.isSelecting = false;
  // 将所有选择到的增加到上次选择的节点中
  Controller.lastSelectedNode = new Set();
  for (const node of StageManager.nodes) {
    if (node.isSelected) {
      Controller.lastSelectedNode.add(node.uuid);
    }
  }
  Controller.lastSelectedEdge = new Set();
  for (const edge of StageManager.edges) {
    if (edge.isSelected) {
      Controller.lastSelectedEdge.add(
        edge.target.uuid + "&" + edge.source.uuid,
      );
    }
  }
};
