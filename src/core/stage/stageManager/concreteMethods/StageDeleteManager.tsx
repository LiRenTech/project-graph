import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { ExplodeAshEffect } from "../../../effect/concrete/ExplodeDashEffect";
import { Edge } from "../../../stageObject/association/Edge";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { Stage } from "../../Stage";
import { StageManager } from "../StageManager";

/**
 * 包含一切删除舞台上的元素的方法
 */
export namespace StageDeleteManager {
  export function deleteNodes(deleteNodes: TextNode[]) {
    for (const node of deleteNodes) {

      // 先判断这个node是否在nodes里
      if (StageManager.getTextNodes().includes(node)) {
        console.log("include node", node.uuid);
        // 从数组中去除
        StageManager.deleteOneTextNode(node);
        // 增加特效
        Stage.effects.push(
          new ExplodeAshEffect(
            new ProgressNumber(0, 30),
            node.collisionBox.getRectangle(),
            node.color.a === 0 ? Color.White : node.color.clone(),
          ),
        );
      } else {
        console.warn("node not in nodes", node.uuid);
      }
      // 删除所有相关的边
      const prepareDeleteEdges: Edge[] = [];
      for (const edge of StageManager.getEdges()) {
        if (edge.source === node || edge.target === node) {
          prepareDeleteEdges.push(edge);
        }
      }
      for (const edge of prepareDeleteEdges) {
        StageManager.deleteOneEdge(edge);
      }
      console.log("delete node", node.uuid);
    }
    StageManager.updateReferences();
  }

  /**
   * 注意不要在遍历edges数组中调用这个方法，否则会导致数组长度变化，导致索引错误
   * @param deleteEdge 要删除的边
   * @returns
   */
  export function deleteEdge(deleteEdge: Edge): boolean {
    const fromNode = deleteEdge.source;
    const toNode = deleteEdge.target;
    // 先判断这两个节点是否在nodes里
    if (
      StageManager.getTextNodes().includes(fromNode) &&
      StageManager.getTextNodes().includes(toNode)
    ) {
      // 删除边
      StageManager.deleteOneEdge(deleteEdge);
      StageManager.updateReferences();
      return true;
    } else {
      console.log("node not in nodes");
      return false;
    }
  }
}
