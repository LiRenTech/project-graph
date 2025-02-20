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
export const ControllerEntityClickSelectAndMove = new ControllerClass();

let isMovingEntity = false;
let mouseDownViewLocation = Vector.getZero();

ControllerEntityClickSelectAndMove.mousedown = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }
  if (Stage.drawingMachine.isUsing) {
    // 涂鸦的时候用不了拖动
    return;
  }
  mouseDownViewLocation = new Vector(event.clientX, event.clientY);

  const pressWorldLocation = Renderer.transformView2World(mouseDownViewLocation);
  ControllerEntityClickSelectAndMove.lastMoveLocation = pressWorldLocation.clone();
  const clickedEntity = StageManager.findEntityByLocation(pressWorldLocation);

  // 防止跳跃式移动的时候改变选中内容
  if (Controller.pressingKeySet.has("alt")) {
    return;
  }

  // 单击选中
  if (clickedEntity !== null) {
    isMovingEntity = true;

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
      // ctrl 按下，只选中节点，不能模仿windows文件管理器设置成反选，否则会和直接移动节点子树冲突
      clickedEntity.isSelected = true;
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

ControllerEntityClickSelectAndMove.mousemove = (event: MouseEvent) => {
  if (Stage.selectMachine.isUsing || Stage.cuttingMachine.isUsing || Controller.pressingKeySet.has("alt")) {
    return;
  }
  if (!isMovingEntity) {
    return;
  }
  const worldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
  const diffLocation = worldLocation.subtract(ControllerEntityClickSelectAndMove.lastMoveLocation);

  if (StageManager.isHaveEntitySelected()) {
    // 移动节点
    isMovingEntity = true;
    // 暂不监听alt键。因为windows下切换窗口时，alt键释放监听不到
    if (Controller.pressingKeySet.has("control")) {
      // 和子节点一起移动
      StageManager.moveNodesWithChildren(diffLocation);
    } else {
      // TODO: 此处结构不合理
      StageManager.moveSelectedTextNodes(diffLocation);
      StageManager.moveSelectedSections(diffLocation);
      StageManager.moveSelectedConnectPoints(diffLocation);
      StageManager.moveSelectedImageNodes(diffLocation);
      StageManager.moveSelectedUrlNodes(diffLocation);
      StageManager.moveSelectedPortalNodes(diffLocation);
      StageManager.moveSelectedPenStrokes(diffLocation);
    }

    // 预瞄反馈
    if (Stage.enableDragAutoAlign) {
      StageManager.preAlignAllSelected();
    }

    ControllerEntityClickSelectAndMove.lastMoveLocation = worldLocation.clone();
  }
};

ControllerEntityClickSelectAndMove.mouseup = (event: MouseEvent) => {
  if (event.button !== 0) {
    return;
  }

  const mouseUpViewLocation = new Vector(event.clientX, event.clientY);
  const diffLocation = mouseUpViewLocation.subtract(mouseDownViewLocation);
  if (diffLocation.magnitude() > 5) {
    // 判定为有效吸附的拖拽操作
    if (isMovingEntity) {
      // 这个时候可以触发对齐吸附事件
      if (Stage.enableDragAutoAlign) {
        StageManager.alignAllSelected();
      }

      StageManager.moveEntityFinished();
    }
  }

  isMovingEntity = false;
};
