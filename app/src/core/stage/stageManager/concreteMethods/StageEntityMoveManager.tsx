import { Vector } from "@graphif/data-structures";
import { Project, service } from "../../../Project";
import { EntityJumpMoveEffect } from "../../../service/feedbackService/effectEngine/concrete/EntityJumpMoveEffect";
import { RectanglePushInEffect } from "../../../service/feedbackService/effectEngine/concrete/RectanglePushInEffect";
import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { GraphMethods } from "../basicMethods/GraphMethods";

/**
 * 管理节点的位置移动
 * 不仅仅有鼠标拖动的移动，还有对齐造成的移动
 * 还要处理节点移动后，对Section大小造成的影响
 * 以后还可能有自动布局的功能
 */
@service("entityMoveManager")
export class EntityMoveManager {
  constructor(private readonly project: Project) {}

  /**
   * 让某一个实体移动一小段距离
   * @param entity
   * @param delta
   * @param isAutoAdjustSection 移动的时候是否触发section框的弹性调整
   */
  moveEntityUtils(entity: Entity, delta: Vector, isAutoAdjustSection: boolean = true) {
    // 让自己移动
    entity.move(delta);

    const nodeUUID = entity.uuid;

    // if (this.project.stageManager.isSectionByUUID(nodeUUID)) {
    //   // 如果是Section，则需要带动孩子一起移动
    //   const section = this.project.stageManager.getSectionByUUID(nodeUUID);
    //   if (section) {
    //     for (const child of section.children) {
    //       moveEntityUtils(child, delta);
    //     }
    //   }
    // }
    if (isAutoAdjustSection) {
      for (const section of this.project.stageManager.getSections()) {
        if (section.isHaveChildrenByUUID(nodeUUID)) {
          section.adjustLocationAndSize();
        }
      }
    }
  }

  /**
   * 跳跃式移动传入的实体
   * 会破坏嵌套关系
   * @param entity
   * @param delta
   */
  jumpMoveEntityUtils(entity: Entity, delta: Vector) {
    const beforeMoveRect = entity.collisionBox.getRectangle().clone();

    // 将自己移动前加特效
    this.project.effects.addEffect(new EntityJumpMoveEffect(15, beforeMoveRect, delta));

    // 即将跳入的sections区域
    const targetSections = this.project.sectionMethods.getSectionsByInnerLocation(beforeMoveRect.center.add(delta));
    // 改变层级
    if (targetSections.length === 0) {
      // 代表想要走出当前section
      const currentFatherSections = this.project.sectionMethods.getFatherSections(entity);
      if (currentFatherSections.length !== 0) {
        this.project.stageManager.goOutSection([entity], currentFatherSections[0]);
      }
    } else {
      this.project.sectionInOutManager.goInSections([entity], targetSections);
      for (const section of targetSections) {
        // 特效
        this.project.effects.addEffect(
          new RectanglePushInEffect(entity.collisionBox.getRectangle(), section.collisionBox.getRectangle()),
        );
      }
    }

    // 让自己移动
    // entity.move(delta);
    this.moveEntityUtils(entity, delta, false);
  }

  /**
   * 将某个实体移动到目标位置
   * @param entity
   * @param location
   */
  moveEntityToUtils(entity: Entity, location: Vector) {
    entity.moveTo(location);
    const nodeUUID = entity.uuid;
    for (const section of this.project.stageManager.getSections()) {
      if (section.isHaveChildrenByUUID(nodeUUID)) {
        section.adjustLocationAndSize();
      }
    }
  }

  /**
   * 移动所有选中的实体一小段距离
   * @param delta
   * @param isAutoAdjustSection
   */
  moveSelectedEntities(delta: Vector, isAutoAdjustSection: boolean = true) {
    for (const node of this.project.stageManager.getEntities()) {
      if (node.isSelected) {
        this.moveEntityUtils(node, delta, isAutoAdjustSection);
      }
    }
  }

  /**
   * 跳跃式移动所有选中的可连接实体
   * 会破坏框的嵌套关系
   * @param delta
   */
  jumpMoveSelectedConnectableEntities(delta: Vector) {
    for (const node of this.project.stageManager.getConnectableEntity()) {
      if (node.isSelected) {
        this.jumpMoveEntityUtils(node, delta);
      }
    }
  }

  /**
   * 树型移动 所有选中的可连接实体
   * @param delta
   */
  moveConnectableEntitiesWithChildren(delta: Vector) {
    for (const node of this.project.stageManager.getConnectableEntity()) {
      if (node.isSelected) {
        this.moveWithChildren(node, delta);
      }
    }
  }
  /**
   * 树形移动传入的可连接实体
   * @param node
   * @param delta
   */
  moveWithChildren(node: ConnectableEntity, delta: Vector) {
    const successorSet = GraphMethods.getSuccessorSet(node);
    for (const successor of successorSet) {
      this.moveEntityUtils(successor, delta);
    }
  }

  // 按住shift键移动
}
