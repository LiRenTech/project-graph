import { Edge } from "../../../stageObject/association/Edge";
import { ConnectPoint } from "../../../stageObject/entity/ConnectPoint";
import { ConnectableEntity } from "../../../stageObject/StageObject";
import { StageManager } from "../StageManager";
import { StageDeleteManager } from "./StageDeleteManager";
import { v4 as uuidv4 } from "uuid";

/**
 * 集成所有连线相关的功能
 */
export namespace StageNodeConnector {
  // 连接两两节点
  // 如果两个节点都是同一个 ConnectPoint类型，则不能连接，因为没有必要
  export function connectConnectableEntity(
    fromNode: ConnectableEntity,
    toNode: ConnectableEntity,
    text: string = "",
  ): void {
    if (
      StageManager.isEntityExists(fromNode.uuid) &&
      StageManager.isEntityExists(toNode.uuid)
    ) {
      if (fromNode.uuid === toNode.uuid && fromNode instanceof ConnectPoint) {
        return;
      }

      if (StageManager.isConnected(fromNode, toNode)) {
        // 已经连接过了，不需要再次连接
        return;
      }
      const newEdge = new Edge({
        source: fromNode.uuid,
        target: toNode.uuid,
        text,
        uuid: uuidv4(),
        type: "core:edge",
      });

      StageManager.addEdge(newEdge);

      StageManager.updateReferences();
      // return addResult;
    }
    // return false;
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
      const sourceNode = StageManager.getConnectableEntityByUUID(
        edge.source.uuid,
      );
      const targetNode = StageManager.getConnectableEntityByUUID(
        edge.target.uuid,
      );
      if (sourceNode && targetNode) {
        connectConnectableEntity(targetNode, sourceNode, edge.text);
      }
    });
  }
}
