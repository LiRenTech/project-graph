import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { PenStroke } from "../../stageObject/entity/PenStroke";
import { StageManager } from "../StageManager";

/**
 * 一切和涂鸦算法相关的内容
 */
export namespace PenStrokeMethods {
  /**
   * 传入一些实体，返回这些实体经过涂鸦粘连扩散后的整个实体集合
   * @param entities 可以代表选中的实体，但不包括涂鸦
   * 返回的结果集合中，不包含传入的实体，只包括额外扩散后的波及实体，也包括涂鸦
   */
  export function getAllRoundedStickEntities(entities: Entity[]): Entity[] {
    const result: Set<string> = new Set();

    const dfs = (entity: ConnectableEntity) => {
      if (result.has(entity.uuid)) {
        return;
      }
      result.add(entity.uuid);
      // 遍历这个实体触碰到的所有涂鸦
      const touchingPenStrokes: PenStroke[] = getTouchingPenStrokes(entity);
      // 将所有涂鸦添加到结果集合中
      for (const penStroke of touchingPenStrokes) {
        result.add(penStroke.uuid);
        // 遍历这个涂鸦触碰到的所有实体
        const touchingEntities: ConnectableEntity[] = getConnectableEntitiesByPenStroke(penStroke);
        // 将所有实体添加到结果集合中
        for (const touchingEntity of touchingEntities) {
          dfs(touchingEntity);
        }
      }
    };

    for (const entity of entities) {
      if (entity instanceof ConnectableEntity) {
        dfs(entity);
      }
    }

    // 最后再排除最开始传入的实体
    for (const entity of entities) {
      result.delete(entity.uuid);
    }
    return StageManager.getEntitiesByUUIDs(Array.from(result));
  }

  /**
   * 此函数最终由快捷键调用
   */
  export function selectEntityByPenStroke() {
    const selectedEntities = StageManager.getSelectedEntities();
    for (const entity of selectedEntities) {
      if (entity instanceof ConnectableEntity) {
        const penStrokes = getTouchingPenStrokes(entity);
        for (const penStroke of penStrokes) {
          penStroke.isSelected = true;
        }
      } else if (entity instanceof PenStroke) {
        const connectableEntities = getConnectableEntitiesByPenStroke(entity);
        for (const connectableEntity of connectableEntities) {
          connectableEntity.isSelected = true;
        }
      }
    }
  }

  /**
   * 获取一个可连接实体触碰到的所有涂鸦
   * @param entity
   * @returns
   */
  export function getTouchingPenStrokes(entity: ConnectableEntity): PenStroke[] {
    const touchingPenStrokes: PenStroke[] = [];
    for (const penStroke of StageManager.getPenStrokes()) {
      if (isConnectableEntityCollideWithPenStroke(entity, penStroke)) {
        touchingPenStrokes.push(penStroke);
      }
    }
    return touchingPenStrokes;
  }

  /**
   * 获取一个涂鸦触碰到的所有实体
   * @param penStroke
   */
  export function getConnectableEntitiesByPenStroke(penStroke: PenStroke): ConnectableEntity[] {
    const touchingEntities: ConnectableEntity[] = [];
    for (const entity of StageManager.getConnectableEntity()) {
      if (isConnectableEntityCollideWithPenStroke(entity, penStroke)) {
        touchingEntities.push(entity);
      }
    }
    return touchingEntities;
  }

  function isConnectableEntityCollideWithPenStroke(entity: ConnectableEntity, penStroke: PenStroke): boolean {
    return penStroke.collisionBox.isIntersectsWithRectangle(entity.collisionBox.getRectangle());
  }
}
