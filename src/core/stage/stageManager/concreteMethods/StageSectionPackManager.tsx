// import { Section } from "../../../stageObject/entity/Section";
// import { Entity } from "../../../stageObject/StageObject";
import { Section } from "../../../stageObject/entity/Section";
import { StageManager } from "../StageManager";

/**
 * 管理所有东西进出StageSection的逻辑
 */
export namespace StageSectionPackManager {
  export function packSection(): void {
    for (const section of StageManager.getSections()) {
      if (!section.isSelected) {
        continue;
      }
      modifyHiddenDfs(section, true);
    }
  }
  function modifyHiddenDfs(section: Section, isCollapsed: boolean) {
    section.isCollapsed = isCollapsed;
    for (const childEntity of section.children) {
      if (childEntity instanceof Section) {
        modifyHiddenDfs(childEntity, isCollapsed);
      } else {
        childEntity.isHiddenBySectionCollapse = isCollapsed;
      }
    }
  }

  export function unpackSection(): void {
    for (const section of StageManager.getSections()) {
      if (!section.isSelected) {
        continue;
      }
      modifyHiddenDfs(section, false);
    }
  }
}
