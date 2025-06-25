import { isMac } from "../../../../../utils/platform";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { LeftMouseModeEnum, Stage } from "../../../../stage/Stage";
import { StageAutoAlignManager } from "../../../../stage/stageManager/concreteMethods/StageAutoAlignManager";
import { StageEntityMoveManager } from "../../../../stage/stageManager/concreteMethods/StageEntityMoveManager";
import { StageObjectSelectCounter } from "../../../../stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { StageHistoryManager } from "../../../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { RectangleNoteEffect } from "../../../feedbackService/effectEngine/concrete/RectangleNoteEffect";
import { RectangleRenderEffect } from "../../../feedbackService/effectEngine/concrete/RectangleRenderEffect";
import { ControllerClass } from "../ControllerClass";
import { ControllerCutting } from "./ControllerCutting";
import { ControllerRectangleSelect } from "./ControllerRectangleSelect";
import { getClickedStageObject } from "./utilsControl";

/**
 * 拖拽节点使其移动的控制器
 *
 */
export class ControllerEntityClickSelectAndMoveClass extends ControllerClass {
  private isMovingEntity = false;
  private mouseDownViewLocation = Vector.getZero();

  public mousedown: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    if (Stage.leftMouseMode !== LeftMouseModeEnum.selectAndMove) {
      return;
    }
    this.mouseDownViewLocation = new Vector(event.clientX, event.clientY);

    const pressWorldLocation = this.project.renderer.transformView2World(this.mouseDownViewLocation);
    this.lastMoveLocation = pressWorldLocation.clone();

    const clickedStageObject = getClickedStageObject(pressWorldLocation);

    // 防止跳跃式移动的时候改变选中内容
    if (this.project.controller.pressingKeySet.has("alt")) {
      return;
    }

    // 单击选中
    if (clickedStageObject !== null) {
      this.isMovingEntity = true;

      if (
        this.project.controller.pressingKeySet.has("shift") &&
        (isMac
          ? this.project.controller.pressingKeySet.has("meta")
          : this.project.controller.pressingKeySet.has("control"))
      ) {
        // ctrl + shift 同时按下
        clickedStageObject.isSelected = !clickedStageObject.isSelected;
      } else if (this.project.controller.pressingKeySet.has("shift")) {
        // shift 按下，只选中节点
        clickedStageObject.isSelected = true;
        // 没有实体被选中则return
        if (StageManager.getSelectedEntities().length === 0) return;
        const rectangles = StageManager.getSelectedEntities().map((entity) => entity.collisionBox.getRectangle());
        const boundingRectangle = Rectangle.getBoundingRectangle(rectangles);
        this.project.effects.addEffect(RectangleRenderEffect.fromShiftClickSelect(boundingRectangle));
        this.project.effects.addEffect(RectangleNoteEffect.fromShiftClickSelect(boundingRectangle));
        for (const entity of StageManager.getStageObject()) {
          if (entity.collisionBox.isIntersectsWithRectangle(boundingRectangle)) {
            entity.isSelected = true;
          }
        }
      } else if (
        isMac
          ? this.project.controller.pressingKeySet.has("meta")
          : this.project.controller.pressingKeySet.has("control")
      ) {
        // ctrl 按下，只选中节点，不能模仿windows文件管理器设置成反选，否则会和直接移动节点子树冲突
        clickedStageObject.isSelected = true;
      } else {
        // 直接点击
        if (!clickedStageObject.isSelected) {
          // 清空所有其他节点的选中状态
          StageManager.getStageObject().forEach((stageObject) => {
            if (stageObject === clickedStageObject) {
              return;
            }
            stageObject.isSelected = false;
          });
        }

        // 选中点击节点的状态
        clickedStageObject.isSelected = true;
      }
    } else {
      // 未点击到节点
    }
    // 更新选中状态
    StageObjectSelectCounter.update();
  };

  public mousemove: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (
      ControllerRectangleSelect.isUsing ||
      ControllerCutting.isUsing ||
      this.project.controller.pressingKeySet.has("alt")
    ) {
      return;
    }
    if (Stage.leftMouseMode !== LeftMouseModeEnum.selectAndMove) {
      return;
    }
    if (!this.isMovingEntity) {
      return;
    }
    const worldLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
    const diffLocation = worldLocation.subtract(this.lastMoveLocation);

    if (StageManager.isHaveEntitySelected()) {
      // 移动节点
      this.isMovingEntity = true;
      // 暂不监听alt键。因为windows下切换窗口时，alt键释放监听不到
      if (
        isMac
          ? this.project.controller.pressingKeySet.has("meta")
          : this.project.controller.pressingKeySet.has("control")
      ) {
        // 和子节点一起移动
        StageEntityMoveManager.moveConnectableEntitiesWithChildren(diffLocation);
      } else {
        StageEntityMoveManager.moveSelectedEntities(diffLocation);
      }

      // 预瞄反馈
      if (Stage.enableDragAutoAlign) {
        StageAutoAlignManager.preAlignAllSelected();
      }

      this.lastMoveLocation = worldLocation.clone();
    }
  };

  public mouseup: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    if (Stage.leftMouseMode !== LeftMouseModeEnum.selectAndMove) {
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
        if (Stage.enableDragAlignToGrid) {
          StageAutoAlignManager.alignAllSelectedToGrid();
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
