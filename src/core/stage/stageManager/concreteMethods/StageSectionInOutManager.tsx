import { Section } from "../../../stageObject/entity/Section";
import { Entity } from "../../../stageObject/StageObject";
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

      section.children.push(entity);
    }
    StageManager.updateReferences();
  }

  export function goOutSection(entities: Entity[], section: Section) {
    const newChildren = section.children.filter(
      (child) => !entities.includes(child),
    );
    section.children = newChildren;
    StageManager.updateReferences();
  }
}
