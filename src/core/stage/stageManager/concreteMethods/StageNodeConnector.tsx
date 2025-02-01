import { v4 as uuidv4 } from "uuid";
import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { CublicCatmullRomSplineEdge } from "../../stageObject/association/CublicCatmullRomSplineEdge";
import { LineEdge } from "../../stageObject/association/LineEdge";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";
import { StageManager } from "../StageManager";
import { StageDeleteManager } from "./StageDeleteManager";
import { GraphMethods } from "../basicMethods/GraphMethods";

/**
 * 集成所有连线相关的功能
 */
export namespace StageNodeConnector {
  /**
   * 检测是否可以连接两个节点
   * @param fromNode
   * @param toNode
   */
  function isConnectable(fromNode: ConnectableEntity, toNode: ConnectableEntity): boolean {
    if (StageManager.isEntityExists(fromNode.uuid) && StageManager.isEntityExists(toNode.uuid)) {
      if (fromNode.uuid === toNode.uuid && fromNode instanceof ConnectPoint) {
        return false;
      }
      if (GraphMethods.isConnected(fromNode, toNode)) {
        // 已经连接过了，不需要再次连接
        return false;
      }
      return true;
    } else {
      return false;
    }
  }
  // 连接两两节点
  // 如果两个节点都是同一个 ConnectPoint类型，则不能连接，因为没有必要
  export function connectConnectableEntity(
    fromNode: ConnectableEntity,
    toNode: ConnectableEntity,
    text: string = "",
  ): void {
    if (!isConnectable(fromNode, toNode)) {
      return;
    }
    const newEdge = new LineEdge({
      source: fromNode.uuid,
      target: toNode.uuid,
      text,
      uuid: uuidv4(),
      type: "core:line_edge",
    });

    StageManager.addLineEdge(newEdge);

    StageManager.updateReferences();
    // return addResult;

    // return false;
  }

  export function addCrEdge(fromNode: ConnectableEntity, toNode: ConnectableEntity): void {
    if (!isConnectable(fromNode, toNode)) {
      return;
    }
    const newEdge = CublicCatmullRomSplineEdge.fromTwoEntity(fromNode, toNode);
    StageManager.addCrEdge(newEdge);
    StageManager.updateReferences();
  }

  // 将多个节点之间全连接

  // 反向连线
  export function reverseEdges(edges: LineEdge[]) {
    // 先全部删除
    edges.forEach((edge) => {
      StageDeleteManager.deleteEdge(edge);
    });
    // 再重新连接
    edges.forEach((edge) => {
      const sourceNode = StageManager.getConnectableEntityByUUID(edge.source.uuid);
      const targetNode = StageManager.getConnectableEntityByUUID(edge.target.uuid);
      if (sourceNode && targetNode) {
        connectConnectableEntity(targetNode, sourceNode, edge.text);
      }
    });
  }
}
