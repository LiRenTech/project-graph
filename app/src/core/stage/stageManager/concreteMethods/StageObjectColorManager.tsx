import { Color } from "../../../dataStruct/Color";
import { StageHistoryManager } from "../StageHistoryManager";
import { StageManager } from "../StageManager";

/**
 * 管理所有 节点/连线 的颜色
 * 不仅包括添加颜色和去除颜色，还包括让颜色变暗和变亮等
 */
export namespace StageObjectColorManager {
  export function setSelectedStageObjectColor(color: Color) {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        node.color = color;
      }
    }
    for (const node of StageManager.getSections()) {
      if (node.isSelected) {
        node.color = color;
      }
    }
    for (const entity of StageManager.getPenStrokes()) {
      if (entity.isSelected) {
        entity.setColor(color);
      }
    }
    for (const edge of StageManager.getLineEdges()) {
      if (edge.isSelected) {
        edge.color = color;
      }
    }
    // 特性：统一取消框选
    StageManager.clearSelectAll();
    StageHistoryManager.recordStep();
  }

  export function setEntityColor(color: Color) {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        node.color = color;
      }
    }
    for (const node of StageManager.getSections()) {
      if (node.isSelected) {
        node.color = color;
      }
    }
    for (const entity of StageManager.getPenStrokes()) {
      if (entity.isSelected) {
        entity.setColor(color);
      }
    }
    StageHistoryManager.recordStep();
  }

  export function darkenNodeColor() {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected && node.color) {
        const darkenedColor = node.color.clone();
        darkenedColor.r = Math.max(darkenedColor.r - 20, 0);
        darkenedColor.g = Math.max(darkenedColor.g - 20, 0);
        darkenedColor.b = Math.max(darkenedColor.b - 20, 0);
        node.color = darkenedColor;
      }
    }
    StageHistoryManager.recordStep();
  }

  export function lightenNodeColor() {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected && node.color) {
        const lightenedColor = node.color.clone();
        lightenedColor.r = Math.min(lightenedColor.r + 20, 255);
        lightenedColor.g = Math.min(lightenedColor.g + 20, 255);
        lightenedColor.b = Math.min(lightenedColor.b + 20, 255);
        node.color = lightenedColor;
      }
    }
    StageHistoryManager.recordStep();
  }
}
