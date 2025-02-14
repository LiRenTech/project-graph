import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { RectangleNoteEffect } from "../../../feedbackService/effectEngine/concrete/RectangleNoteEffect";
import { RectangleRenderEffect } from "../../../feedbackService/effectEngine/concrete/RectangleRenderEffect";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 拖拽节点使其移动的控制器
 *
 */
export const ControllerEntityMove = new ControllerClass();

ControllerEntityMove.mousedown = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }

  const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
  ControllerEntityMove.lastMoveLocation = pressWorldLocation.clone();
  const clickedEntity = StageManager.findConnectableEntityByLocation(pressWorldLocation);

  // 防止跳跃式移动的时候改变选中内容
  if (Controller.pressingKeySet.has("alt")) {
    return;
  }

  // 单击选中
  if (clickedEntity !== null) {
    Controller.isMovingEntity = true;

    if (Controller.pressingKeySet.has("shift") && Controller.pressingKeySet.has("control")) {
      // ctrl + shift 同时按下
      clickedEntity.isSelected = !clickedEntity.isSelected;
    } else if (Controller.pressingKeySet.has("shift")) {
      // shift 按下，只选中节点
      clickedEntity.isSelected = true;
      const rectangles = StageManager.getSelectedEntities().map((entity) => entity.collisionBox.getRectangle());
      const boundingRectangle = Rectangle.getBoundingRectangle(rectangles);
      Stage.effectMachine.addEffect(RectangleRenderEffect.fromShiftClickSelect(boundingRectangle));
      Stage.effectMachine.addEffect(RectangleNoteEffect.fromShiftClickSelect(boundingRectangle));
      for (const entity of StageManager.getStageObject()) {
        if (entity.collisionBox.isIntersectsWithRectangle(boundingRectangle)) {
          entity.isSelected = true;
        }
      }
    } else if (Controller.pressingKeySet.has("control")) {
      // ctrl 按下，只选中节点
      // 反转点击节点的状态
      clickedEntity.isSelected = !clickedEntity.isSelected;
      Stage.effectMachine.addEffect(
        RectangleNoteEffect.fromShiftClickSelect(clickedEntity.collisionBox.getRectangle()),
      );
    } else {
      // 直接点击
      if (!clickedEntity.isSelected) {
        // 清空所有其他节点的选中状态
        StageManager.getStageObject().forEach((stageObject) => {
          if (stageObject === clickedEntity) {
            return;
          }
          stageObject.isSelected = false;
        });
      }

      // 选中点击节点的状态
      clickedEntity.isSelected = true;
    }
  }
};

ControllerEntityMove.mousemove = (event: MouseEvent) => {
  if (Stage.selectMachine.isUsing || Stage.cuttingMachine.isUsing || Controller.pressingKeySet.has("alt")) {
    return;
  }
  if (!Controller.isMovingEntity) {
    return;
  }
  const worldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
  const diffLocation = worldLocation.subtract(ControllerEntityMove.lastMoveLocation);

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
    // TODO: 此处结构不合理
    StageManager.moveSelectedSections(diffLocation);
    StageManager.moveSelectedConnectPoints(diffLocation);
    StageManager.moveSelectedImageNodes(diffLocation);
    StageManager.moveSelectedUrlNodes(diffLocation);
    StageManager.moveSelectedPortalNodes(diffLocation);

    // 预瞄反馈
    if (Stage.enableDragAutoAlign) {
      StageManager.preAlignAllSelected();
    }

    ControllerEntityMove.lastMoveLocation = worldLocation.clone();
  }
};

ControllerEntityMove.mouseup = (event: MouseEvent) => {
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
