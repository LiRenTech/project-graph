import { Association } from "../../stageObject/abstract/Association";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { ImageNode } from "../../stageObject/entity/ImageNode";
import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";
import { StageManager } from "../StageManager";

/**
 * 实时记录选中的各种类型的对象的数量
 * 用于工具栏实时切换按钮的显示
 */
export namespace StageObjectSelectCounter {
  // 用于UI层监测
  export let selectedEntityCount = 0;
  export let selectedEdgeCount = 0;
  export let selectedImageNodeCount = 0;
  export let selectedTextNodeCount = 0;
  export let selectedSectionCount = 0;

  // export function changeStageObjectSelectState(stageObject: StageObject, isNewStatusSelected: boolean) {
  //   // selectedEntityCount = 0;
  //   // selectedEdgeCount = 0;
  //   // selectedImageNodeCount = 0;
  //   // selectedTextNodeCount = 0;
  //   // selectedSectionCount = 0;
  //   // if (stageObject instanceof Entity) {
  //   //   selectedEntityCount += isNewStatusSelected ? 1 : 0;
  //   //   if (stageObject instanceof ImageNode) {
  //   //     selectedImageNodeCount += isNewStatusSelected ? 1 : 0;
  //   //   } else if (stageObject instanceof TextNode) {
  //   //     selectedTextNodeCount += isNewStatusSelected ? 1 : 0;
  //   //   } else if (stageObject instanceof Section) {
  //   //     selectedSectionCount += isNewStatusSelected ? 1 : 0;
  //   //   }
  //   // } else if (stageObject instanceof Association) {
  //   //   selectedEdgeCount += isNewStatusSelected ? 1 : 0;
  //   // }
  // }

  export function toDebugString(): string {
    return `entity: ${selectedEntityCount}, edge: ${selectedEdgeCount}, imageNode: ${selectedImageNodeCount}, textNode: ${selectedTextNodeCount}, section: ${selectedSectionCount}`;
  }

  /**
   * 上次更新时间
   * 防止频繁更新，影响性能
   */
  let lastUpdateTimestamp = 0;

  export function update() {
    if (Date.now() - lastUpdateTimestamp < 10) {
      return;
    }
    lastUpdateTimestamp = Date.now();

    // 刷新UI层的选中数量

    selectedEntityCount = 0;
    selectedEdgeCount = 0;
    selectedImageNodeCount = 0;
    selectedTextNodeCount = 0;
    selectedSectionCount = 0;

    for (const stageObject of StageManager.getStageObject()) {
      if (!stageObject.isSelected) {
        continue;
      }
      if (stageObject instanceof Entity) {
        selectedEntityCount++;
        if (stageObject instanceof ImageNode) {
          selectedImageNodeCount++;
        } else if (stageObject instanceof TextNode) {
          selectedTextNodeCount++;
        } else if (stageObject instanceof Section) {
          selectedSectionCount++;
        }
      } else if (stageObject instanceof Association) {
        selectedEdgeCount++;
      }
    }
  }
}
