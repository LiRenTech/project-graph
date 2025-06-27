import { CursorNameEnum } from "../../../../../types/cursors";
import { isMac } from "../../../../../utils/platform";
import { Vector } from "../../../../dataStruct/Vector";
import { LeftMouseModeEnum, Stage } from "../../../../stage/Stage";
import { StageMultiTargetEdgeMove } from "../../../../stage/stageManager/concreteMethods/StageMultiTargetEdgeMove";
import { StageNodeConnector } from "../../../../stage/stageManager/concreteMethods/StageNodeConnector";
import { StageHistoryManager } from "../../../../stage/stageManager/StageHistoryManager";
import { MultiTargetUndirectedEdge } from "../../../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { ControllerClass } from "../ControllerClass";

/**
 * 关系的重新塑性控制器
 *
 * 曾经：旋转图的节点控制器
 * 鼠标按住Ctrl旋转节点
 * 或者拖拽连线旋转
 *
 * 有向边的嫁接
 */
export class ControllerAssociationReshapeClass extends ControllerClass {
  public mousewheel: (event: WheelEvent) => void = (event: WheelEvent) => {
    if (
      isMac ? this.project.controller.pressingKeySet.has("meta") : this.project.controller.pressingKeySet.has("control")
    ) {
      const location = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
      const hoverNode = this.project.stageManager.findTextNodeByLocation(location);
      if (hoverNode !== null) {
        // 旋转节点
        if (event.deltaY > 0) {
          this.project.stageNodeRotate.rotateNodeDfs(hoverNode, hoverNode, 10, []);
        } else {
          this.project.stageNodeRotate.rotateNodeDfs(hoverNode, hoverNode, -10, []);
        }
      }
    }
  };

  public lastMoveLocation: Vector = Vector.getZero();

  public mousedown: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (Stage.leftMouseMode !== LeftMouseModeEnum.selectAndMove) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    const pressWorldLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
    // 点击
    const clickedAssociation = this.project.stageManager.findAssociationByLocation(pressWorldLocation);
    if (clickedAssociation === null) {
      return;
    }
    const isHaveLineEdgeSelected = this.project.stageManager.getLineEdges().some((edge) => edge.isSelected);
    const isHaveMultiTargetEdgeSelected = this.project.stageManager
      .getSelectedAssociations()
      .some((association) => association instanceof MultiTargetUndirectedEdge);

    this.lastMoveLocation = pressWorldLocation.clone();

    if (isHaveLineEdgeSelected) {
      this.project.controller.isMovingEdge = true;

      if (clickedAssociation.isSelected) {
        // E1
        this.project.stageManager.getLineEdges().forEach((edge) => {
          edge.isSelected = false;
        });
      } else {
        // E2
        this.project.stageManager.getLineEdges().forEach((edge) => {
          edge.isSelected = false;
        });
      }
      clickedAssociation.isSelected = true;
    } else if (isHaveMultiTargetEdgeSelected) {
      // 点击了多源无向边
      clickedAssociation.isSelected = true;
    } else {
      // F
      clickedAssociation.isSelected = true;
    }
    this.project.controller.setCursorNameHook(CursorNameEnum.Move);
  };

  public mousemove: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (Stage.leftMouseMode !== LeftMouseModeEnum.selectAndMove) {
      return;
    }
    if (this.project.controller.rectangleSelect.isUsing || this.project.controller.cutting.isUsing) {
      return;
    }
    const worldLocation = this.project.renderer.transformView2World(new Vector(event.clientX, event.clientY));
    if (this.project.controller.isMouseDown[0]) {
      if (
        isMac
          ? this.project.controller.pressingKeySet.has("meta")
          : this.project.controller.pressingKeySet.has("control")
      ) {
        // 更改Edge的目标
        const entity = this.project.stageManager.findConnectableEntityByLocation(worldLocation);
        if (entity !== null) {
          // 找到目标，更改目标
          StageNodeConnector.changeSelectedEdgeTarget(entity);
        }
      } else {
        const diffLocation = worldLocation.subtract(this.lastMoveLocation);
        // 拖拽Edge
        this.project.controller.isMovingEdge = true;
        this.project.stageNodeRotate.moveEdges(this.lastMoveLocation, diffLocation);
        StageMultiTargetEdgeMove.moveMultiTargetEdge(diffLocation);
      }
      this.lastMoveLocation = worldLocation.clone();
    } else {
      // 什么都没有按下的情况
      // 看看鼠标当前的位置是否和线接近
      this.project.mouseInteraction.updateByMouseMove(worldLocation);
    }
  };

  public mouseup: (event: MouseEvent) => void = (event: MouseEvent) => {
    if (Stage.leftMouseMode !== LeftMouseModeEnum.selectAndMove) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    if (this.project.controller.isMovingEdge) {
      StageHistoryManager.recordStep(); // 鼠标抬起了，移动结束，记录历史过程
      this.project.controller.isMovingEdge = false;
    }
    this.project.controller.setCursorNameHook(CursorNameEnum.Default);
  };
}
