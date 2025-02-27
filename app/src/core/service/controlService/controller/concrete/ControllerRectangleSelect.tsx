import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Stage } from "../../../../stage/Stage";
import { SectionMethods } from "../../../../stage/stageManager/basicMethods/SectionMethods";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { StageObject } from "../../../../stage/stageObject/abstract/StageObject";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

class ControllerRectangleSelectClass extends ControllerClass {
  /**
   * 框选按下时在哪个section里按下
   */
  private mouseDownSection: Section | null = null;

  private _isUsing: boolean = false;
  /**
   * 框选框
   * 这里必须一开始为null，否则报错，can not asses "Rectangle"
   * 这个框选框是基于世界坐标的。
   * 此变量会根据两个点的位置自动更新。
   */
  public selectingRectangle: Rectangle | null = null;

  private selectStartLocation: Vector = Vector.getZero();
  private selectEndLocation: Vector = Vector.getZero();

  public get isUsing() {
    return this._isUsing;
  }

  public shutDown() {
    this._isUsing = false;
  }

  public mouseMoveOutWindowForcedShutdown(mouseLocation: Vector) {
    super.mouseMoveOutWindowForcedShutdown(mouseLocation);
    this.shutDown();
  }

  public mousedown: (event: MouseEvent) => void = (event) => {
    if (Controller.pressingKeySet.has("alt")) {
      // layer moving mode
      return;
    }
    if (Stage.drawingMachine.isUsing) {
      return;
    }
    const button = event.button;
    if (button !== 0) {
      return;
    }
    const pressWorldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));

    if (
      StageManager.isEntityOnLocation(pressWorldLocation) ||
      StageManager.isAssociationOnLocation(pressWorldLocation)
    ) {
      // 不是点击在空白处
      return;
    }

    const isHaveEdgeSelected = StageManager.getLineEdges().some((edge) => edge.isSelected);
    const isHaveEntitySelected = StageManager.getEntities().some((entity) => entity.isSelected);

    // 现在的情况：在空白的地方按下左键

    const sections = SectionMethods.getSectionsByInnerLocation(pressWorldLocation);
    if (sections.length === 0) {
      // 没有在任何section里按下
      this.mouseDownSection = null;
    } else {
      this.mouseDownSection = sections[0];
    }

    if (isHaveEntitySelected || isHaveEdgeSelected) {
      // A
      if (Controller.pressingKeySet.has("shift") || Controller.pressingKeySet.has("control")) {
        // 不取消选择
      } else {
        // 取消选择所
        StageManager.getStageObject().forEach((stageObject) => {
          stageObject.isSelected = false;
        });
      }
    }

    // 更新框选框状态
    this._isUsing = true;
    this.selectStartLocation = pressWorldLocation.clone();
    this.selectEndLocation = pressWorldLocation.clone();
    this.selectingRectangle = new Rectangle(pressWorldLocation.clone(), Vector.getZero());

    const clickedEdge = StageManager.findEdgeByLocation(pressWorldLocation);
    if (clickedEdge !== null) {
      // 在连线身上按下
      this._isUsing = false;
    }
    ControllerRectangleSelect.lastMoveLocation = pressWorldLocation.clone();
  };

  public mousemove: (event: MouseEvent) => void = (event) => {
    if (!this._isUsing) {
      return;
    }
    if (!Controller.isMouseDown[0]) {
      return;
    }
    const worldLocation = Renderer.transformView2World(new Vector(event.clientX, event.clientY));
    // 正在框选
    this.selectEndLocation = worldLocation.clone();

    // 更新框选框
    this.selectingRectangle = Rectangle.fromTwoPoints(this.selectStartLocation, this.selectEndLocation);
    // 更新框选方向
    this.isSelectDirectionRight = this.selectStartLocation.x < this.selectEndLocation.x;

    // 框选框在 section框中的限制情况
    if (this.mouseDownSection !== null) {
      this.selectingRectangle = Rectangle.getIntersectionRectangle(
        this.selectingRectangle,
        this.mouseDownSection.rectangle.expandFromCenter(-10),
      );
    }

    if (Controller.pressingKeySet.has("shift") || Controller.pressingKeySet.has("control")) {
      // 移动过程中不先暴力清除
    } else {
      // 先清空所有已经选择了的
      StageManager.getStageObject().forEach((stageObject) => {
        stageObject.isSelected = false;
      });
    }

    if (Controller.pressingKeySet.has("control")) {
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
      for (const edge of StageManager.getLineEdges()) {
        if (this.isSelectWithEntity(edge)) {
          if (Controller.lastSelectedEdgeUUID.has(edge.uuid)) {
            edge.isSelected = false;
          } else {
            edge.isSelected = true;
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
        for (const edge of StageManager.getLineEdges()) {
          if (edge.isHiddenBySectionCollapse) {
            continue;
          }
          if (this.isSelectWithEntity(edge)) {
            edge.isSelected = true;
          }
        }
      }
    }
    selectedEntityNormalizing();

    // Controller.isMovingEntity = false;
    Controller.isMovingEdge = false;
    ControllerRectangleSelect.lastMoveLocation = worldLocation.clone();
  };

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
  /**
   * 当前的框选框的方向
   */
  private isSelectDirectionRight = false;
  // 获取此时此刻应该的框选逻辑
  public getSelectMode(): "contain" | "intersect" {
    if (this.isSelectDirectionRight) {
      return Stage.rectangleSelectWhenRight;
    } else {
      return Stage.rectangleSelectWhenLeft;
    }
  }

  public mouseup = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    // 左键松开
    this._isUsing = false;
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
  };
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

/**
 * 框选控制器
 */
export const ControllerRectangleSelect = new ControllerRectangleSelectClass();
