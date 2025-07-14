import { v4 as uuidv4 } from "uuid";
import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { CubicCatmullRomSplineEdge } from "../../stageObject/association/CubicCatmullRomSplineEdge";
import { LineEdge } from "../../stageObject/association/LineEdge";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";
import { GraphMethods } from "../basicMethods/GraphMethods";
import { StageHistoryManager } from "../StageHistoryManager";
import { StageManager } from "../StageManager";

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

  /**
   * 如果两个节点都是同一个 ConnectPoint 对象类型，则不能连接，因为没有必要
   * @param fromNode
   * @param toNode
   * @param text
   * @returns
   */
  export function connectConnectableEntity(
    fromNode: ConnectableEntity,
    toNode: ConnectableEntity,
    text: string = "",
    targetRectRate?: [number, number],
    sourceRectRate?: [number, number],
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
      color: [0, 0, 0, 0],
      targetRectRate: targetRectRate || [0.5, 0.5],
      sourceRectRate: sourceRectRate || [0.5, 0.5],
    });

    StageManager.addLineEdge(newEdge);

    StageManager.updateReferences();
  }

  export function addCrEdge(fromNode: ConnectableEntity, toNode: ConnectableEntity): void {
    if (!isConnectable(fromNode, toNode)) {
      return;
    }
    const newEdge = CubicCatmullRomSplineEdge.fromTwoEntity(fromNode, toNode);
    StageManager.addCrEdge(newEdge);
    StageManager.updateReferences();
  }

  // 将多个节点之间全连接

  // 反向连线
  export function reverseEdges(edges: LineEdge[]) {
    edges.forEach((edge) => {
      const oldSource = edge.source;
      edge.source = edge.target;
      edge.target = oldSource;
      const oldSourceRectRage = edge.sourceRectangleRate;
      edge.setSourceRectangleRate(edge.targetRectangleRate);
      edge.setTargetRectangleRate(oldSourceRectRage);
    });
    StageManager.updateReferences();
  }

  /**
   * 单独改变一个节点的连接点
   * @param edge
   * @param newTarget
   * @returns
   */
  function changeEdgeTarget(edge: LineEdge, newTarget: ConnectableEntity) {
    if (edge.target.uuid === newTarget.uuid) {
      return;
    }
    edge.target = newTarget;
    StageManager.updateReferences();
  }

  /**
   * 改变所有选中的连线的目标节点
   * @param newTarget
   */
  export function changeSelectedEdgeTarget(newTarget: ConnectableEntity) {
    const selectedEdges = StageManager.getSelectedStageObjects().filter((obj) => obj instanceof LineEdge);
    for (const edge of selectedEdges) {
      if (edge instanceof LineEdge) {
        changeEdgeTarget(edge, newTarget);
      }
    }
    StageHistoryManager.recordStep();
  }
}
