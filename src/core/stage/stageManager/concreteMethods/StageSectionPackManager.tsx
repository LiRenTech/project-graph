// import { Section } from "../../../stageObject/entity/Section";
// import { Entity } from "../../../stageObject/StageObject";
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
      section.isCollapsed = true;
    }
  }

  export function unpackSection(): void {
    for (const section of StageManager.getSections()) {
      if (!section.isSelected) {
        continue;
      }
      section.isCollapsed = false;
    }
  }
}
