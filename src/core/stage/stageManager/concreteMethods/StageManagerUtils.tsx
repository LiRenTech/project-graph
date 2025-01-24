import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";
import { StageObject } from "../../stageObject/StageObject";
import { StageManager } from "../StageManager";

/**
 * 舞台管理器相关的工具函数
 *
 */
export namespace StageManagerUtils {
  /**
   * 替换不需要在舞台上做检测的自动生成的名称
   * @param template
   * @returns
   */
  function replaceAutoNameWithoutStage(template: string): string {
    if (template.includes("{{date}}")) {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      template = template.replaceAll("{{date}}", `${year}-${month}-${date}`);
    }
    if (template.includes("{{time}}")) {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const second = now.getSeconds();
      template = template.replaceAll("{{time}}", `${hour}:${minute}:${second}`);
    }
    return template;
  }

  /**
   * 替换带有{{i}} 命名的自动生成的名称
   * @param template
   * @param targetStageObject
   */
  export function replaceAutoNameTemplate(
    currentName: string,
    targetStageObject: StageObject,
  ): string {
    // 先替换掉不需要检测舞台上内容的部分
    currentName = replaceAutoNameWithoutStage(currentName);

    if (currentName.includes("{{i}}")) {
      let i = 0;
      while (true) {
        const currentCmpName = currentName.replace("{{i}}", i.toString());
        let isConflict = false;
        if (targetStageObject instanceof TextNode) {
          isConflict = isNameConflictWithTextNodes(currentCmpName);
        } else if (targetStageObject instanceof Section) {
          isConflict = isNameConflictWithSections(currentCmpName);
        }
        if (isConflict) {
          i++;
          continue;
        } else {
          // 没有冲突，就这样了
          break;
        }
      }
      currentName = currentName.replaceAll("{{i}}", i.toString());
    }
    return currentName;
  }

  function isNameConflictWithTextNodes(name: string): boolean {
    for (const node of StageManager.getTextNodes()) {
      if (node.text === name) {
        return true;
      }
    }
    return false;
  }

  function isNameConflictWithSections(name: string): boolean {
    for (const section of StageManager.getSections()) {
      if (section.text === name) {
        return true;
      }
    }
    return false;
  }
}
