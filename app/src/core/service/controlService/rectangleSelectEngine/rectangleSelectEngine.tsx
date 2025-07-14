import { isMac } from "../../../../utils/platform";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { Stage } from "../../../stage/Stage";
import { SectionMethods } from "../../../stage/stageManager/basicMethods/SectionMethods";
import { StageObjectSelectCounter } from "../../../stage/stageManager/concreteMethods/StageObjectSelectCounter";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { StageObject } from "../../../stage/stageObject/abstract/StageObject";
import { Edge } from "../../../stage/stageObject/association/Edge";
import { Section } from "../../../stage/stageObject/entity/Section";
import { Controller } from "../controller/Controller";

/**
 * 框选引擎
 * 因为不止鼠标会用到框选，mac下的空格+双指移动可能也用到框选功能
 * 所以框选功能单独抽离成一个引擎，提供API被其他地方调用
 */
export class RectangleSelectEngine {
  constructor() {}
  // 开始点
  private selectStartLocation = Vector.getZero();
  // 结束点
  private selectEndLocation = Vector.getZero();
  public getSelectStartLocation(): Vector {
    return this.selectStartLocation.clone();
  }
  public getSelectEndLocation(): Vector {
    return this.selectEndLocation.clone();
  }
  private selectingRectangle: Rectangle | null = null;
  // 将框选框限制在某个section内
  private limitSection: Section | null = null;

  private isSelectDirectionRight = true;

  getRectangle(): Rectangle | null {
    return this.selectingRectangle;
  }
  public shutDown() {
    this.selectingRectangle = null;
  }

  startSelecting(worldLocation: Vector) {
    const isHaveEdgeSelected = StageManager.getAssociations().some((association) => association.isSelected);
    const isHaveEntitySelected = StageManager.getEntities().some((entity) => entity.isSelected);

    const sections = SectionMethods.getSectionsByInnerLocation(worldLocation);
    if (sections.length === 0) {
      // 没有在任何section里按下
      this.limitSection = null;
    } else {
      this.limitSection = sections[0];
    }

    if (isHaveEntitySelected || isHaveEdgeSelected) {
      // A
      if (
        Controller.pressingKeySet.has("shift") ||
        (isMac ? Controller.pressingKeySet.has("meta") : Controller.pressingKeySet.has("control"))
      ) {
        // 不取消选择
      } else {
        // 取消选择所
        StageManager.getStageObject().forEach((stageObject) => {
          stageObject.isSelected = false;
        });
      }
    }
    // 更新矩形状态
    this.selectingRectangle = new Rectangle(worldLocation.clone(), Vector.getZero());
    this.selectStartLocation = worldLocation.clone();
    this.selectEndLocation = worldLocation.clone();

    // 更新选中内容的数量
    StageObjectSelectCounter.update();
  }

  moveSelecting(newEndLocation: Vector) {
    if (!this.selectingRectangle) {
      return;
    }
    this.selectEndLocation = newEndLocation.clone();

    // 更新框选框
    this.selectingRectangle = Rectangle.fromTwoPoints(this.selectStartLocation, this.selectEndLocation);
    // 更新框选方向
    this.isSelectDirectionRight = this.selectStartLocation.x < this.selectEndLocation.x;

    // 框选框在 section框中的限制情况
    if (this.limitSection !== null) {
      this.selectingRectangle = Rectangle.getIntersectionRectangle(
        this.selectingRectangle,
        this.limitSection.rectangle.expandFromCenter(-10),
      );
    }

    this.updateStageObjectByMove();
    Controller.isMovingEdge = false;
    // 更新选中内容的数量
    StageObjectSelectCounter.update();
  }

  /**
   * 相当于鼠标松开释放
   */
  endSelecting() {
    // 将所有选择到的增加到上次选择的节点中
    Controller.lastSelectedEntityUUID.clear();
    for (const node of StageManager.getEntities()) {
      if (node.isSelected) {
        Controller.lastSelectedEntityUUID.add(node.uuid);
      }
    }

    Controller.lastSelectedEdgeUUID.clear();
    for (const edge of StageManager.getLineEdges()) {
      if (edge.isSelected) {
        Controller.lastSelectedEdgeUUID.add(edge.uuid);
      }
    }
    // 更新选中数量
    StageObjectSelectCounter.update();
    this.selectingRectangle = null;
  }

  private updateStageObjectByMove() {
    if (
      Controller.pressingKeySet.has("shift") ||
      (isMac ? Controller.pressingKeySet.has("meta") : Controller.pressingKeySet.has("control"))
    ) {
      // 移动过程中不先暴力清除
    } else {
      // 先清空所有已经选择了的
      StageManager.getStageObject().forEach((stageObject) => {
        stageObject.isSelected = false;
      });
    }

    if (isMac ? Controller.pressingKeySet.has("meta") : Controller.pressingKeySet.has("control")) {
      // 交叉选择，没的变有，有的变没
      for (const entity of StageManager.getEntities()) {
        if (entity.isHiddenBySectionCollapse) {
          continue;
        }
        if (this.isSelectWithEntity(entity)) {
          if (Controller.lastSelectedEntityUUID.has(entity.uuid)) {
            entity.isSelected = false;
          } else {
            entity.isSelected = true;
          }
        }
      }
      for (const association of StageManager.getAssociations()) {
        if (this.isSelectWithEntity(association)) {
          if (Controller.lastSelectedEdgeUUID.has(association.uuid)) {
            association.isSelected = false;
          } else {
            association.isSelected = true;
          }
        }
      }
    } else {
      let isHaveEntity = false;
      // 框选逻辑优先级：
      // Entity > Edge

      // Entity
      if (!isHaveEntity) {
        for (const otherEntities of StageManager.getEntities()) {
          // if (otherEntities instanceof Section) {
          //   continue;
          // }
          if (otherEntities.isHiddenBySectionCollapse) {
            continue;
          }

          if (this.isSelectWithEntity(otherEntities)) {
            otherEntities.isSelected = true;
            isHaveEntity = true;
          }
        }
      }

      // Edge
      if (!isHaveEntity) {
        // 如果已经有节点被选择了，则不能再选择边了
        for (const edge of StageManager.getAssociations()) {
          if (edge instanceof Edge && edge.isHiddenBySectionCollapse) {
            continue;
          }
          if (this.isSelectWithEntity(edge)) {
            edge.isSelected = true;
          }
        }
      }
    }
    selectedEntityNormalizing();
  }

  /**
   * 判断当前的框选框是否选中了某个实体
   * @param entity
   */
  private isSelectWithEntity(entity: StageObject) {
    if (entity.collisionBox && this.selectingRectangle) {
      const mode = this.getSelectMode();
      if (mode === "intersect") {
        return entity.collisionBox.isIntersectsWithRectangle(this.selectingRectangle);
      } else {
        return entity.collisionBox.isContainedByRectangle(this.selectingRectangle);
      }
    }
    return false;
  }

  // 获取此时此刻应该的框选逻辑
  public getSelectMode(): "contain" | "intersect" {
    if (this.isSelectDirectionRight) {
      return Stage.rectangleSelectWhenRight;
    } else {
      return Stage.rectangleSelectWhenLeft;
    }
  }
}

/**
 * 规范化选择的实体
 *  法则：永远不能同时框选一个东西和它包含在内部的东西。
 */
function selectedEntityNormalizing() {
  const entities = StageManager.getSelectedEntities();
  const shallowerSections = SectionMethods.shallowerSection(entities.filter((entity) => entity instanceof Section));
  const shallowerEntities = SectionMethods.shallowerNotSectionEntities(entities);
  for (const entity of entities) {
    if (entity instanceof Section) {
      if (!shallowerSections.includes(entity)) {
        entity.isSelected = false;
      }
    } else {
      if (!shallowerEntities.includes(entity)) {
        entity.isSelected = false;
      }
    }
  }
}
