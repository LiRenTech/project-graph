import { StageManager } from "../../stage/stageManager/StageManager";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
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
  const clickedNode = StageManager.findTextNodeByLocation(pressWorldLocation);
  const clickedEdge = StageManager.findEdgeByLocation(pressWorldLocation);
  const clickedSection = StageManager.findSectionByLocation(pressWorldLocation);
  if (clickedNode !== null || clickedEdge !== null || clickedSection !== null) {
    // 在空白地方按下，才能触发框选
    return;
  }
  const isHaveNodeSelected = StageManager.getTextNodes().some(
    (node) => node.isSelected,
  );
  const isHaveEdgeSelected = StageManager.getEdges().some(
    (edge) => edge.isSelected,
  );
  const isHaveSectionSelected = StageManager.getSections().some(
    (section) => section.isSelected,
  );

  console.log(isHaveNodeSelected, isHaveEdgeSelected, isHaveSectionSelected);
  // 现在的情况：在空白的地方按下左键

  if (isHaveNodeSelected || isHaveEdgeSelected || isHaveSectionSelected) {
    // A
    if (
      Controller.pressingKeySet.has("shift") ||
      Controller.pressingKeySet.has("control")
    ) {
      // 不取消选择
      console.log("A");
    } else {
      // 取消选择所有节点
      StageManager.getTextNodes().forEach((node) => {
        node.isSelected = false;
      });
      // 取消选择所有边
      StageManager.getEdges().forEach((edge) => {
        edge.isSelected = false;
      });
      // 取消选择所有section
      StageManager.getSections().forEach((section) => {
        section.isSelected = false;
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

  // 更新框选框
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
    StageManager.getTextNodes().forEach((node) => {
      node.isSelected = false;
    });
    StageManager.getEdges().forEach((edge) => {
      edge.isSelected = false;
    });
    StageManager.getSections().forEach((section) => {
      section.isSelected = false;
    });
  }

  if (Controller.pressingKeySet.has("control")) {
    // 交叉选择，没的变有，有的变没
    for (const section of StageManager.getSections()) {
      if (
        section.collisionBox.isRectangleInCollisionBox(Stage.selectingRectangle)
      ) {
        if (Controller.lastSelectedEntity.has(section.uuid)) {
          section.isSelected = false;
        } else {
          section.isSelected = true;
        }
      }
    }
    for (const node of StageManager.getTextNodes()) {
      if (
        node.collisionBox.isRectangleInCollisionBox(Stage.selectingRectangle)
      ) {
        if (Controller.lastSelectedEntity.has(node.uuid)) {
          node.isSelected = false;
        } else {
          node.isSelected = true;
        }
      }
    }
    for (const edge of StageManager.getEdges()) {
      if (
        edge.collisionBox.isRectangleInCollisionBox(Stage.selectingRectangle)
      ) {
        if (Controller.lastSelectedEdge.has(edge.uuid)) {
          edge.isSelected = false;
        } else {
          edge.isSelected = true;
        }
      }
    }
  } else {
    let isHaveNode = false;
    for (const section of StageManager.getSections()) {
      if (
        section.collisionBox.isRectangleInCollisionBox(Stage.selectingRectangle)
      ) {
        section.isSelected = true;
        isHaveNode = true;
      }
    }
    if (!isHaveNode) {
      for (const node of StageManager.getTextNodes()) {
        if (
          node.collisionBox.isRectangleInCollisionBox(Stage.selectingRectangle)
        ) {
          node.isSelected = true;
          isHaveNode = true;
        }
      }
    }
    if (!isHaveNode) {
      // 如果已经有节点被选择了，则不能再选择边了
      for (const edge of StageManager.getEdges()) {
        if (
          edge.collisionBox.isRectangleInCollisionBox(Stage.selectingRectangle)
        ) {
          edge.isSelected = true;
        }
      }
    }
  }
  Controller.isMovingEntity = false;
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
  Controller.lastSelectedEntity.clear();
  for (const node of StageManager.getTextNodes()) {
    if (node.isSelected) {
      Controller.lastSelectedEntity.add(node.uuid);
    }
  }
  Controller.lastSelectedEdge.clear();
  for (const edge of StageManager.getEdges()) {

    if (edge.isSelected) {
      Controller.lastSelectedEdge.add(edge.uuid);
    }
  }
};
