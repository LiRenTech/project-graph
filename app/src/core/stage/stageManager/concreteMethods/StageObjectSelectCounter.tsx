import { Association } from "../../stageObject/abstract/Association";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { CubicCatmullRomSplineEdge } from "../../stageObject/association/CubicCatmullRomSplineEdge";
import { Edge } from "../../stageObject/association/Edge";
import { MultiTargetUndirectedEdge } from "../../stageObject/association/MutiTargetUndirectedEdge";
import { ImageNode } from "../../stageObject/entity/ImageNode";
import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";

/**
 * 实时记录选中的各种类型的对象的数量
 * 用于工具栏实时切换按钮的显示
 */
export namespace StageObjectSelectCounter {
  // 用于UI层监测
  export let selectedStageObjectCount = 0;
  export let selectedEntityCount = 0;
  export let selectedAssociationCount = 0;
  export let selectedEdgeCount = 0;
  export let selectedCREdgeCount = 0;
  export let selectedImageNodeCount = 0;
  export let selectedTextNodeCount = 0;
  export let selectedSectionCount = 0;
  export let selectedMultiTargetUndirectedEdgeCount = 0;

  export function toDebugString(): string {
    return `entity: ${selectedEntityCount}, edge: ${selectedEdgeCount}, cr-edge: ${selectedCREdgeCount}, imageNode: ${selectedImageNodeCount}, textNode: ${selectedTextNodeCount}, section: ${selectedSectionCount}`;
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
    selectedStageObjectCount = 0;
    selectedEntityCount = 0;
    selectedEdgeCount = 0;
    selectedCREdgeCount = 0;
    selectedImageNodeCount = 0;
    selectedTextNodeCount = 0;
    selectedSectionCount = 0;
    selectedAssociationCount = 0;
    selectedMultiTargetUndirectedEdgeCount = 0;

    for (const stageObject of this.project.stageManager.getStageObject()) {
      if (!stageObject.isSelected) {
        continue;
      }
      selectedStageObjectCount++;
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
        selectedAssociationCount++;
        if (stageObject instanceof MultiTargetUndirectedEdge) {
          selectedMultiTargetUndirectedEdgeCount++;
        }
        if (stageObject instanceof Edge) {
          selectedEdgeCount++;
          if (stageObject instanceof CubicCatmullRomSplineEdge) {
            selectedCREdgeCount++;
          }
        }
      }
    }
  }
}
