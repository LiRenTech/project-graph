import { Edge } from "../../../Edge";
import { Node } from "../../../Node";
import { StageManager } from "../StageManager";
/**
 * 集成所有连线相关的功能
 */
export namespace StageNodeConnector {

  // 连接两两节点
  export function connectNode(fromNode: Node, toNode: Node): boolean {
    if (StageManager.nodes.includes(fromNode) && StageManager.nodes.includes(toNode)) {
      const addResult = fromNode.addChild(toNode);
      const newEdge = new Edge({
        source: fromNode.uuid,
        target: toNode.uuid,
        text: "",
      });

      // TODO 双向线检测

      StageManager.edges.push(newEdge);

      StageManager.updateReferences();
      return addResult;
    }
    return false;
  }

  // 将多个节点之间全连接

  
}