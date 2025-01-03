import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

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
  ControllerNodeMove.lastMoveLocation = pressWorldLocation.clone();
  const clickedEntity =
    StageManager.findConnectableEntityByLocation(pressWorldLocation);
  if (clickedEntity !== null) {
    Controller.isMovingEntity = true;
    if (clickedEntity && !clickedEntity.isSelected) {
      StageManager.getEntities().forEach((entity) => {
        entity.isSelected = false;
      });
      clickedEntity.isSelected = true;
    }
    // 同时清空所有边的选中状态
    StageManager.getAssociations().forEach((edge) => {
      edge.isSelected = false;
    });
  }
};

ControllerNodeMove.mousemove = (event: MouseEvent) => {
  if (
    Stage.isSelecting ||
    Stage.isCutting ||
    Controller.pressingKeySet.has("alt")
  ) {
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

  if (StageManager.isHaveEntitySelected()) {
    // 移动节点
    Controller.isMovingEntity = true;
    // 暂不监听alt键。因为windows下切换窗口时，alt键释放监听不到
    if (Controller.pressingKeySet.has("control")) {
      // 和子节点一起移动
      StageManager.moveNodesWithChildren(diffLocation);
    } else {
      StageManager.moveSelectedNodes(diffLocation);
    }
    StageManager.moveSelectedSections(diffLocation);
    StageManager.moveSelectedConnectPoints(diffLocation);
    StageManager.moveSelectedImageNodes(diffLocation);

    // 预瞄反馈
    if (Stage.enableDragAutoAlign) {
      StageManager.preAlignAllSelected();
    }

    ControllerNodeMove.lastMoveLocation = worldLocation.clone();
  }
};

ControllerNodeMove.mouseup = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  if (Controller.isMovingEntity) {
    // 这个时候可以触发对齐吸附事件
    if (Stage.enableDragAutoAlign) {
      StageManager.alignAllSelected();
    }

    StageManager.moveEntityFinished();
  }
  Controller.isMovingEntity = false;
};
