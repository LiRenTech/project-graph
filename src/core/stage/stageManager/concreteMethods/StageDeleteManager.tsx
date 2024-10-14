import { Edge } from "../../../entity/Edge";
import { Node } from "../../../entity/Node";
import { StageManager } from "../StageManager";

/**
 * 包含一切删除舞台上的元素的方法
 */
export namespace StageDeleteManager {
  
  export function deleteNodes(deleteNodes: Node[]) {
    for (const node of deleteNodes) {
      // 先判断这个node是否在nodes里
      if (StageManager.nodes.includes(node)) {
        console.log("include node", node.uuid);
        // 从数组中去除
        StageManager.nodes.splice(StageManager.nodes.indexOf(node), 1);
        console.log(StageManager.nodes);
      } else {
        console.warn("node not in nodes", node.uuid);
      }
      // 不仅要删除节点本身，其他节点的child中也要删除该节点
      for (const fatherNode of StageManager.nodes) {
        // if node in father_node.children
        if (fatherNode.children.includes(node)) {
          fatherNode.children.splice(fatherNode.children.indexOf(node), 1);
        }
      }
      // 删除所有相关的边
      const prepareDeleteEdges: Edge[] = [];
      for (const edge of StageManager.edges) {
        if (edge.source === node || edge.target === node) {
          prepareDeleteEdges.push(edge);
        }
      }
      for (const edge of prepareDeleteEdges) {
        StageManager.edges.splice(StageManager.edges.indexOf(edge), 1);
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
      StageManager.nodes.includes(fromNode) &&
      StageManager.nodes.includes(toNode)
    ) {
      // 从数组中去除
      const res = fromNode.removeChild(toNode);
      // 删除边
      StageManager.edges.splice(StageManager.edges.indexOf(deleteEdge), 1);
      StageManager.updateReferences();
      return res;
    } else {
      console.log("node not in nodes");
      return false;
    }
  }
}
