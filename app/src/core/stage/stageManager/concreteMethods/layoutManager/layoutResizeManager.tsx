import { TextNode } from "../../../stageObject/entity/TextNode";

/**
 * 统一修改大小的布局管理器
 */
export namespace LayoutResizeManager {
  /**
   * 统一调整选中文本节点的宽度
   */
  export function adjustSelectedTextNodeWidth(mode: "maxWidth" | "minWidth" | "average") {
    const selectedTextNode = this.project.stageManager
      .getSelectedEntities()
      .filter((entity) => entity instanceof TextNode);
    const maxWidth = selectedTextNode.reduce((acc, cur) => Math.max(acc, cur.collisionBox.getRectangle().width), 0);
    const minWidth = selectedTextNode.reduce(
      (acc, cur) => Math.min(acc, cur.collisionBox.getRectangle().width),
      Infinity,
    );
    const average =
      selectedTextNode.reduce((acc, cur) => acc + cur.collisionBox.getRectangle().width, 0) / selectedTextNode.length;

    for (const textNode of selectedTextNode) {
      textNode.sizeAdjust = "manual";
      switch (mode) {
        case "maxWidth":
          textNode.resizeWidthTo(maxWidth);
          break;
        case "minWidth":
          textNode.resizeWidthTo(minWidth);
          break;
        case "average":
          textNode.resizeWidthTo(average);
          break;
      }
    }
  }
}
