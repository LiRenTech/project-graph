import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { MultiTargetUndirectedEdge } from "../../stageObject/association/MutiTargetUndirectedEdge";
import { StageManager } from "../StageManager";

/**
 * 超图方法集合
 */
export namespace HyperGraphMethods {
  /**
   * 根据一个节点获取所有连接它的超边
   *
   * 需要遍历所有的关系，以及每一个超边的所有目标节点，判断是否包含这个节点
   */
  export function getHyperEdgesByNode(node: ConnectableEntity): MultiTargetUndirectedEdge[] {
    const edges: MultiTargetUndirectedEdge[] = [];
    const hyperEdges = StageManager.getAssociations().filter(
      (association) => association instanceof MultiTargetUndirectedEdge,
    );
    for (const hyperEdge of hyperEdges) {
      if (hyperEdge.targetUUIDs.includes(node.uuid)) {
        edges.push(hyperEdge);
      }
    }
    return edges;
  }
}
