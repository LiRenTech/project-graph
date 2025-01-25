import { Section } from "../../stageObject/entity/Section";
import { Entity } from "../../stageObject/StageObject";
import { StageManager } from "../StageManager";

/**
 * 管理所有东西进出StageSection的逻辑
 */
export namespace StageSectionInOutManager {
  export function goInSection(entities: Entity[], section: Section) {
    for (const entity of entities) {
      if (section.children.includes(entity)) {
        // 已经在section里面了，不用再次进入
        continue;
      }
      if (entity === section) {
        // 自己不能包自己
        continue;
      }
      section.childrenUUIDs.push(entity.uuid);
      section.children.push(entity);
    }
    StageManager.updateReferences();
  }

  export function goOutSection(entities: Entity[], section: Section) {
    const newChildren = [];
    for (const child of section.children) {
      if (!entities.includes(child)) {
        newChildren.push(child);
      }
    }
    section.children = newChildren;
    const newChildrenUUIDs = [];
    for (const childUUID of section.childrenUUIDs) {
      if (!entities.some((entity) => entity.uuid === childUUID)) {
        newChildrenUUIDs.push(childUUID);
      }
    }
    section.childrenUUIDs = newChildrenUUIDs;
    StageManager.updateReferences();
  }
}
