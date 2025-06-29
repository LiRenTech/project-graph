import { v4 as uuidv4 } from "uuid";
import { Project, service } from "../../../Project";
import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { CubicCatmullRomSplineEdge } from "../../stageObject/association/CubicCatmullRomSplineEdge";
import { LineEdge } from "../../stageObject/association/LineEdge";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";
import { GraphMethods } from "../basicMethods/GraphMethods";
import { StageHistoryManager } from "../StageHistoryManager";

/**
 * 集成所有连线相关的功能
 */
@service("nodeConnector")
export class NodeConnector {
  constructor(private readonly project: Project) {}

  /**
   * 检测是否可以连接两个节点
   * @param fromNode
   * @param toNode
   */
  private isConnectable(fromNode: ConnectableEntity, toNode: ConnectableEntity): boolean {
    if (
      this.project.stageManager.isEntityExists(fromNode.uuid) &&
      this.project.stageManager.isEntityExists(toNode.uuid)
    ) {
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
  connectConnectableEntity(
    fromNode: ConnectableEntity,
    toNode: ConnectableEntity,
    text: string = "",
    targetRectRate?: [number, number],
    sourceRectRate?: [number, number],
  ): void {
    if (!this.isConnectable(fromNode, toNode)) {
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

    this.project.stageManager.addLineEdge(newEdge);

    this.project.stageManager.updateReferences();
  }

  addCrEdge(fromNode: ConnectableEntity, toNode: ConnectableEntity): void {
    if (!this.isConnectable(fromNode, toNode)) {
      return;
    }
    const newEdge = CubicCatmullRomSplineEdge.fromTwoEntity(fromNode, toNode);
    this.project.stageManager.addCrEdge(newEdge);
    this.project.stageManager.updateReferences();
  }

  // 将多个节点之间全连接

  // 反向连线
  reverseEdges(edges: LineEdge[]) {
    edges.forEach((edge) => {
      const oldSource = edge.source;
      edge.source = edge.target;
      edge.target = oldSource;
      const oldSourceRectRage = edge.sourceRectangleRate;
      edge.setSourceRectangleRate(edge.targetRectangleRate);
      edge.setTargetRectangleRate(oldSourceRectRage);
    });
    this.project.stageManager.updateReferences();
  }

  /**
   * 单独改变一个节点的连接点
   * @param edge
   * @param newTarget
   * @returns
   */
  private changeEdgeTarget(edge: LineEdge, newTarget: ConnectableEntity) {
    if (edge.target.uuid === newTarget.uuid) {
      return;
    }
    edge.target = newTarget;
    this.project.stageManager.updateReferences();
  }

  /**
   * 改变所有选中的连线的目标节点
   * @param newTarget
   */
  changeSelectedEdgeTarget(newTarget: ConnectableEntity) {
    const selectedEdges = this.project.stageManager.getSelectedStageObjects().filter((obj) => obj instanceof LineEdge);
    for (const edge of selectedEdges) {
      if (edge instanceof LineEdge) {
        this.changeEdgeTarget(edge, newTarget);
      }
    }
    StageHistoryManager.recordStep();
  }
}
