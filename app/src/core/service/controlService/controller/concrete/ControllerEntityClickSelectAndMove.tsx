import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { StageAutoAlignManager } from "../../../../stage/stageManager/concreteMethods/StageAutoAlignManager";
import { StageEntityMoveManager } from "../../../../stage/stageManager/concreteMethods/StageEntityMoveManager";
import { StageHistoryManager } from "../../../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { RectangleNoteEffect } from "../../../feedbackService/effectEngine/concrete/RectangleNoteEffect";
import { RectangleRenderEffect } from "../../../feedbackService/effectEngine/concrete/RectangleRenderEffect";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 拖拽节点使其移动的控制器
 *
 */
class ControllerEntityClickSelectAndMoveClass extends ControllerClass {
  private isMovingEntity = false;
  private mouseDownViewLocation = Vector.getZero();

  public mousedown: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    if (Stage.drawingMachine.isUsing) {
      // 涂鸦的时候用不了拖动
      return;
    }
    this.mouseDownViewLocation = new Vector(event.clientX, event.clientY);

    const pressWorldLocation = Renderer.transformView2World(this.mouseDownViewLocation);
    this.lastMoveLocation = pressWorldLocation.clone();
    const clickedEntity = StageManager.findEntityByLocation(pressWorldLocation);

    // 防止跳跃式移动的时候改变选中内容
    if (Controller.pressingKeySet.has("alt")) {
      return;
    }

    // 单击选中
    if (clickedEntity !== null) {
      this.isMovingEntity = true;

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

  public mousemove: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (Stage.selectMachine.isUsing || Stage.cuttingMachine.isUsing || Controller.pressingKeySet.has("alt")) {
      return;
    }
    if (!this.isMovingEntity) {
      return;
    }
    const worldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    const diffLocation = worldLocation.subtract(ControllerEntityClickSelectAndMove.lastMoveLocation);

    if (StageManager.isHaveEntitySelected()) {
      // 移动节点
      this.isMovingEntity = true;
      // 暂不监听alt键。因为windows下切换窗口时，alt键释放监听不到
      if (Controller.pressingKeySet.has("control")) {
        // 和子节点一起移动
        StageEntityMoveManager.moveConnectableEntitiesWithChildren(diffLocation);
      } else {
        StageEntityMoveManager.moveSelectedEntities(diffLocation);
      }

      // 预瞄反馈
      if (Stage.enableDragAutoAlign) {
        StageAutoAlignManager.preAlignAllSelected();
      }

      ControllerEntityClickSelectAndMove.lastMoveLocation = worldLocation.clone();
    }
  };

  public mouseup: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }

    const mouseUpViewLocation = new Vector(event.clientX, event.clientY);
    const diffLocation = mouseUpViewLocation.subtract(this.mouseDownViewLocation);
    if (diffLocation.magnitude() > 5) {
      // 判定为有效吸附的拖拽操作
      if (this.isMovingEntity) {
        // 这个时候可以触发对齐吸附事件
        if (Stage.enableDragAutoAlign) {
          StageAutoAlignManager.alignAllSelected();
        }

        StageHistoryManager.recordStep(); // 记录一次历史
      }
    }

    this.isMovingEntity = false;
  };

  public mouseMoveOutWindowForcedShutdown(_outsideLocation: Vector): void {
    super.mouseMoveOutWindowForcedShutdown(_outsideLocation);
    this.isMovingEntity = false;
  }
}

export const ControllerEntityClickSelectAndMove = new ControllerEntityClickSelectAndMoveClass();
