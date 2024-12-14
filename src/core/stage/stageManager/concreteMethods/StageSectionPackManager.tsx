// import { Section } from "../../../stageObject/entity/Section";
// import { Entity } from "../../../stageObject/StageObject";
import { Section } from "../../../stageObject/entity/Section";
import { StageManager } from "../StageManager";

/**
 * 管理所有东西进出StageSection的逻辑
 */
export namespace StageSectionPackManager {
  /** 折叠起来 */
  export function packSection(): void {
    for (const section of StageManager.getSections()) {
      if (!section.isSelected) {
        continue;
      }
      modifyHiddenDfs(section, true);
      section.isCollapsed = true;
    }
    StageManager.updateReferences();
  }

  /**
   * 由于复层折叠，引起所有子节点的被隐藏状态发生改变
   * @param section
   * @param isCollapsed
   */
  function modifyHiddenDfs(section: Section, isCollapsed: boolean) {
    // section.isCollapsed = isCollapsed;
    for (const childEntity of section.children) {
      if (childEntity instanceof Section) {
        modifyHiddenDfs(childEntity, isCollapsed);
      }
      childEntity.isHiddenBySectionCollapse = isCollapsed;
    }
  }

  /** 展开 */
  export function unpackSection(): void {
    for (const section of StageManager.getSections()) {
      if (!section.isSelected) {
        continue;
      }
      modifyHiddenDfs(section, false);
      section.isCollapsed = false;
    }
    StageManager.updateReferences();
  }

  export function switchCollapse(): void {
    for (const section of StageManager.getSections()) {
      if (!section.isSelected) {
        continue;
      }
      if (section.isCollapsed) {
        unpackSection();
      } else {
        packSection();
      }
    }
  }
}
