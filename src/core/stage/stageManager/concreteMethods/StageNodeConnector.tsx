import { Edge } from "../../../entity/Edge";
import { Node } from "../../../entity/Node";
import { StageManager } from "../StageManager";
import { StageDeleteManager } from "./StageDeleteManager";

/**
 * 集成所有连线相关的功能
 */
export namespace StageNodeConnector {
  // 连接两两节点
  export function connectNode(
    fromNode: Node,
    toNode: Node,
    text: string = "",
  ): boolean {
    if (
      StageManager.nodes.includes(fromNode) &&
      StageManager.nodes.includes(toNode)
    ) {
      const addResult = fromNode.addChild(toNode);
      
      if (!addResult) {
        // 重复添加了，添加失败
        return false;
      }

      const newEdge = new Edge({
        source: fromNode.uuid,
        target: toNode.uuid,
        text,
      });

      // TODO 双向线检测

      StageManager.edges.push(newEdge);

      StageManager.updateReferences();
      return addResult;
    }
    return false;
  }

  // 将多个节点之间全连接

  // 反向连线
  export function reverseEdges(edges: Edge[]) {
    // 先全部删除
    edges.forEach((edge) => {
      StageDeleteManager.deleteEdge(edge);
    });
    // 再重新连接
    edges.forEach((edge) => {
      const sourceNode = StageManager.getNodeByUUID(edge.source.uuid);
      const targetNode = StageManager.getNodeByUUID(edge.target.uuid);
      if (sourceNode && targetNode) {
        connectNode(targetNode, sourceNode, edge.text);
      }
    });
  }
}
