import { Entity } from "../../stageObject/abstract/StageEntity";
import { Section } from "../../stageObject/entity/Section";
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
    for (const entity of entities) {
      sectionDropChild(section, entity);
    }
    StageManager.updateReferences();
  }

  /**
   * Section 丢弃某个孩子
   * @param section
   * @param entity
   */
  function sectionDropChild(section: Section, entity: Entity) {
    const newChildrenUUID: string[] = [];
    const newChildren: Entity[] = [];
    for (const child of section.children) {
      if (entity.uuid !== child.uuid) {
        newChildrenUUID.push(child.uuid);
        newChildren.push(child);
      }
    }
    section.childrenUUIDs = newChildrenUUID;
    section.children = newChildren;
  }
}
