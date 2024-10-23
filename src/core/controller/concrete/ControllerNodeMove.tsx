import { StageManager } from "../../stage/stageManager/StageManager";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { Vector } from "../../dataStruct/Vector";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { Entity } from "../../stageObject/StageObject";

/**
 * 拖拽节点使其移动的控制器
 *
 */
export const ControllerNodeMove = new ControllerClass();

ControllerNodeMove.mousedown = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }

  const pressWorldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const isHaveNodeSelected = StageManager.getTextNodes().some(
    (node) => node.isSelected,
  );
  const isHaveSectionSelected = StageManager.getSections().some(
    (section) => section.isSelected,
  );
  ControllerNodeMove.lastMoveLocation = pressWorldLocation.clone();
  const clickedNode = StageManager.findTextNodeByLocation(pressWorldLocation);
  const clickedSection = StageManager.findSectionByLocation(pressWorldLocation);

  if (clickedSection !== null) {
    Controller.isMovingEntity = true;
    if (isHaveSectionSelected && !clickedSection.isSelected) {
      StageManager.getSections().forEach((section) => {
        section.isSelected = false;
      });
    }
    clickedSection.isSelected = true;
  }

  if (clickedNode !== null) {
    Controller.isMovingEntity = true;
    if (isHaveNodeSelected && !clickedNode.isSelected) {
      StageManager.getTextNodes().forEach((node) => {
        node.isSelected = false;
      });
    }
    clickedNode.isSelected = true;
  }
};

ControllerNodeMove.mousemove = (event: MouseEvent) => {
  if (Stage.isSelecting || Stage.isCutting) {
    return;
  }
  if (!Controller.isMovingEntity) {
    return;
  }
  const worldLocation = Renderer.transformView2World(
    new Vector(event.clientX, event.clientY),
  );
  const diffLocation = worldLocation.subtract(
    ControllerNodeMove.lastMoveLocation,
  );

  if (
    StageManager.getTextNodes().some((node) => node.isSelected) ||
    StageManager.getSections().some((section) => section.isSelected)
  ) {
    // 移动节点
    Controller.isMovingEntity = true;
    // 暂不监听alt键。因为windows下切换窗口时，alt键释放监听不到
    if (Controller.pressingKeySet.has("control")) {
      // 和子节点一起移动
      StageManager.moveNodesWithChildren(diffLocation);
    } else {
      StageManager.moveNodes(diffLocation);
    }
    StageManager.moveSections(diffLocation);
    ControllerNodeMove.lastMoveLocation = worldLocation.clone();
  }
};

ControllerNodeMove.mouseup = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  if (Controller.isMovingEntity) {
    // 如果是在SectionHover状态下松开鼠标的，将选中的东西放入Section
    const entityList: Entity[] = [
      ...StageManager.getTextNodes().filter((entity) => entity.isSelected),
      ...StageManager.getSections().filter((entity) => entity.isSelected),
    ];
    for (const section of Stage.hoverSections) {
      StageManager.goInSection(entityList, section);
    }
    StageManager.moveNodeFinished();
  }
  Controller.isMovingEntity = false;
};
