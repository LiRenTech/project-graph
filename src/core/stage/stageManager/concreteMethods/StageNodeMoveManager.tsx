import { Vector } from "../../../dataStruct/Vector";
import { StageManager } from "../StageManager";

/**
 * 管理节点的位置移动
 * 不仅仅有鼠标拖动的移动，还有对齐造成的移动
 * 以后还可能有自动布局的功能
 */
export namespace StageNodeMoveManager {
  /**
   * 拖动所有选中的节点一起移动
   * @param delta
   */
  export function moveNodes(delta: Vector) {
    for (const node of StageManager.nodes) {
      if (node.isSelected) {
        node.move(delta);
      }
    }
  }

  export function moveNodesWithChildren(delta: Vector) {
    for (const node of StageManager.nodes) {
      if (node.isSelected) {
        node.moveWithChildren(delta);
      }
    }
  }

  // 按住shift键移动
}
