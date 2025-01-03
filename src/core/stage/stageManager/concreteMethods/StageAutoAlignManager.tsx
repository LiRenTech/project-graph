import { NumberFunctions } from "../../../algorithm/numberFunctions";
import { Vector } from "../../../dataStruct/Vector";
import { EntityAlignEffect } from "../../../effect/concrete/EntityAlignEffect";
import { SoundService } from "../../../SoundService";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { Entity } from "../../../stageObject/StageObject";
import { Stage } from "../../Stage";
import { StageManager } from "../StageManager";

export namespace StageAutoAlignManager {
  /**
   * 吸附函数
   */
  export function alignAllSelected() {
    const selectedEntities = StageManager.getSelectedEntities();
    const otherEntities = StageManager.getEntities().filter(
      (entity) => !entity.isSelected,
    );
    for (const selectedEntity of selectedEntities) {
      if (!(selectedEntity instanceof TextNode)) {
        continue;
      }
      onEntityMoveAlignToOtherEntity(selectedEntity, otherEntities);
    }
  }

  /**
   * 将一个节点对齐到其他节点
   * @param selectedEntity
   * @param otherEntities 其他未选中的节点，在上游做好筛选
   */
  function onEntityMoveAlignToOtherEntity(
    selectedEntity: Entity,
    otherEntities: Entity[],
  ) {
    // // 只能和一个节点对齐
    // let isHaveAlignTarget = false;
    // 按照与 selectedEntity 的距离排序
    const sortedOtherEntities = otherEntities.sort((a, b) => {
      const distanceA = calculateDistance(selectedEntity, a);
      const distanceB = calculateDistance(selectedEntity, b);
      return distanceA - distanceB; // 升序排序
    });
    let isAlign = false;
    // 目前先只做节点吸附

    // X轴对齐 ||||
    for (const otherEntity of sortedOtherEntities) {
      const isHaveAlignTarget = onEntityMoveAlignToTargetEntityX(
        selectedEntity,
        otherEntity,
      );
      if (isHaveAlignTarget) {
        isAlign = true;
        break;
      }
    }
    // Y轴对齐 =
    for (const otherEntity of sortedOtherEntities) {
      const isHaveAlignTarget = onEntityMoveAlignToTargetEntityY(
        selectedEntity,
        otherEntity,
      );
      if (isHaveAlignTarget) {
        isAlign = true;
        break;
      }
    }
    if (isAlign) {
      SoundService.play.alignAndAttach();
    }
  }

  function _addAlignEffect(selectedEntity: Entity, otherEntity: Entity) {
    Stage.effects.push(
      EntityAlignEffect.fromEntity(
        selectedEntity.collisionBox.getRectangle(),
        otherEntity.collisionBox.getRectangle(),
      ),
    );
  }

  /**
   * 将一个节点对齐到另一个节点
   * @param selectedEntity
   * @param otherEntity
   * @returns
   */
  function onEntityMoveAlignToTargetEntityX(
    selectedEntity: Entity,
    otherEntity: Entity,
  ): boolean {
    // 左侧x轴对齐
    if (
      NumberFunctions.isNumberNear(
        selectedEntity.collisionBox.getRectangle().left,
        otherEntity.collisionBox.getRectangle().left,
        25,
      )
    ) {
      selectedEntity.move(
        new Vector(
          otherEntity.collisionBox.getRectangle().left -
            selectedEntity.collisionBox.getRectangle().left,
          0,
        ),
      );
      // 添加特效
      _addAlignEffect(selectedEntity, otherEntity);
      return true;
    }
    // 右侧x轴对齐
    if (
      NumberFunctions.isNumberNear(
        selectedEntity.collisionBox.getRectangle().right,
        otherEntity.collisionBox.getRectangle().right,
        25,
      )
    ) {
      selectedEntity.move(
        new Vector(
          otherEntity.collisionBox.getRectangle().right -
            selectedEntity.collisionBox.getRectangle().right,
          0,
        ),
      );
      // 添加特效
      _addAlignEffect(selectedEntity, otherEntity);
      return true;
    }
    return false;
  }

  function onEntityMoveAlignToTargetEntityY(
    selectedEntity: Entity,
    otherEntity: Entity,
  ) {
    // 上侧y轴对齐
    if (
      NumberFunctions.isNumberNear(
        selectedEntity.collisionBox.getRectangle().top,
        otherEntity.collisionBox.getRectangle().top,
        25,
      )
    ) {
      selectedEntity.move(
        new Vector(
          0,
          otherEntity.collisionBox.getRectangle().top -
            selectedEntity.collisionBox.getRectangle().top,
        ),
      );
      // 添加特效
      _addAlignEffect(selectedEntity, otherEntity);
      return true;
    }
    // 下侧y轴对齐
    if (
      NumberFunctions.isNumberNear(
        selectedEntity.collisionBox.getRectangle().bottom,
        otherEntity.collisionBox.getRectangle().bottom,
        25,
      )
    ) {
      selectedEntity.move(
        new Vector(
          0,
          otherEntity.collisionBox.getRectangle().bottom -
            selectedEntity.collisionBox.getRectangle().bottom,
        ),
      );
      // 添加特效
      _addAlignEffect(selectedEntity, otherEntity);
      return true;
    }
    return false;
  }

  // 假设你有一个方法可以计算两个节点之间的距离
  function calculateDistance(entityA: Entity, entityB: Entity) {
    const rectA = entityA.collisionBox.getRectangle();
    const rectB = entityB.collisionBox.getRectangle();

    // 计算距离，可以根据需要选择合适的距离计算方式
    const dx = rectA.center.x - rectB.center.x;
    const dy = rectA.center.y - rectB.center.y;

    return Math.sqrt(dx * dx + dy * dy); // 返回欧几里得距离
  }
}
