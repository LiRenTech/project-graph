import { NodeManager } from "../../NodeManager";
import { Rectangle } from "../../dataStruct/Rectangle";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
/**
 * 可能的情况
 *  ------------ | 已有对象被选择 | 没有对象被选择
 *  在空白地方按下 |      A       |      B
 *  在节点身上按下 |    C1,C2     |      D
 *  在连线身上按下 |    E1,E2     |      F
 *  ------------ |  ------------ |  ------------
 * A：取消选择那些节点，可能要重新开始框选
 * B：可能是想开始框选
 * C：
 *    C1: 如果点击的节点属于被上次选中的节点中，那么整体移动，（如果还按下了Alt键，开始整体复制）
 *    C2: 如果点击的节点不属于被上次选中的节点中，那么单击选择，并取消上一次框选的所有节点
 * D：只想单击这一个节点，或者按下Alt键的时候，想复制这个节点
 *
 * 更新被选中的节点，如果没有选中节点就开始框选
 */

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
  const clickedNode = NodeManager.findNodeByLocation(pressWorldLocation);
  const clickedEdge = NodeManager.findEdgeByLocation(pressWorldLocation);
  if (clickedNode !== null) {
    // 在空白地方按下，才能触发框选
    return;
  }
  const isHaveNodeSelected = NodeManager.nodes.some((node) => node.isSelected);

  // 现在的情况：在空白的地方按下左键

  if (isHaveNodeSelected) {
    // A
    if (
      Controller.pressingKeySet.has("shift") ||
      Controller.pressingKeySet.has("control")
    ) {
      // 不取消选择
    } else {
      // 取消选择所有节点
      NodeManager.nodes.forEach((node) => {
        node.isSelected = false;
      });
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
    console.log("没有连线被按下");
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
    NodeManager.nodes.forEach((node) => {
      node.isSelected = false;
    });
  }

  if (Controller.pressingKeySet.has("control")) {
    // 交叉选择，没的变有，有的变没
    for (const node of NodeManager.nodes) {
      if (Stage.selectingRectangle.isCollideWith(node.rectangle)) {
        if (Controller.lastSelectedNode.has(node.uuid)) {
          node.isSelected = false;
        } else {
          node.isSelected = true;
        }
      }
    }
  } else {
    for (const node of NodeManager.nodes) {
      if (Stage.selectingRectangle.isCollideWith(node.rectangle)) {
        node.isSelected = true;
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
  for (const node of NodeManager.nodes) {
    if (node.isSelected) {
      Controller.lastSelectedNode.add(node.uuid);
    }
  }
};
