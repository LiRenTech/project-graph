import { Color } from "../../../dataStruct/Color";
import { StageManager } from "../StageManager";

/**
 * 管理所有节点的颜色
 * 不仅包括添加颜色和去除颜色，还包括让颜色变暗和变亮等
 */
export namespace StageNodeColorManager {
  export function setNodeColor(color: Color) {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        node.color = color;
      }
    }
  }

  export function clearNodeColor() {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        node.color = Color.Transparent;
      }
    }
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
  }
}
