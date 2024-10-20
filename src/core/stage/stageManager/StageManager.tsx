import { Color } from "../../dataStruct/Color";
import { Edge } from "../../stageObject/Edge";
import { TextNode } from "../../stageObject/TextNode";
import { Renderer } from "../../render/canvas2d/renderer";
import { Vector } from "../../dataStruct/Vector";
import { StageNodeRotate } from "./concreteMethods/stageNodeRotate";
import { StageNodeAdder } from "./concreteMethods/stageNodeAdder";
import { StageDeleteManager } from "./concreteMethods/StageDeleteManager";
import { StageNodeConnector } from "./concreteMethods/StageNodeConnector";
import { StageNodeMoveManager } from "./concreteMethods/StageNodeMoveManager";
import { StageNodeColorManager } from "./concreteMethods/StageNodeColorManager";
import { Serialized } from "../../../types/node";
import { StageSerializedAdder } from "./concreteMethods/StageSerializedAdder";
import { StageHistoryManager } from "./concreteMethods/StageHistoryManager";
import { Stage } from "../Stage";
import { StageDumper } from "../StageDumper";

// littlefean:应该改成类，实例化的对象绑定到舞台上。这成单例模式了
// 开发过程中会造成多开
// zty012:这个是存储数据的，和舞台无关，应该单独抽离出来
// 并且会在舞台之外的地方操作，所以应该是namespace单例

/**
 * 舞台管理器，也可以看成包含了很多操作方法的《舞台实体容器》
 * 管理节点、边的关系等，内部包含了舞台上的所有实体
 */
export namespace StageManager {
  export const nodes: TextNode[] = [];
  export const edges: Edge[] = [];
  /**
   * 销毁函数
   * 以防开发过程中造成多开
   */
  export function destroy() {
    StageManager.nodes.splice(0, StageManager.nodes.length);
    StageManager.edges.splice(0, StageManager.edges.length);
  }

  export function addNode(node: TextNode) {
    nodes.push(node);
  }

  export function addEdge(edge: Edge) {
    edges.push(edge);
  }
  
  // 用于UI层监测
  export let selectedNodeCount = 0;
  export let selectedEdgeCount = 0;

  /** 获取节点连接的子节点数组 */
  export function nodeChildrenArray(node: TextNode): TextNode[] {
    const res: TextNode[] = [];
    for (const edge of edges) {
      if (edge.source === node) {
        res.push(edge.target);
      }
    }
    return res;
  }
  function isConnected(node: TextNode, target: TextNode): boolean {
    for (const edge of edges) {
      if (edge.source === node && edge.target === target) {
        return true;
      }
    }
    return false;
  }

  /**
   * 更新节点的引用，将unknown的节点替换为真实的节点，保证对象在内存中的唯一性
   * 节点什么情况下会是unknown的？
   *
   */
  export function updateReferences() {
    for (const node of nodes) {
      // for (const otherNode of nodes) {
      //   for (const child of otherNode.children) {
      //     if (child.unknown && child.uuid === node.uuid) {
      //       otherNode.children.splice(otherNode.children.indexOf(child), 1);
      //       otherNode.children.push(child);
      //     }
      //   }
      // }
      for (const edge of edges) {
        if (edge.source.unknown && edge.source.uuid === node.uuid) {
          edge.source = node;
        }
        if (edge.target.unknown && edge.target.uuid === node.uuid) {
          edge.target = node;
        }
      }
    }
  }

  export function getNodeByUUID(uuid: string): TextNode | null {
    for (const node of nodes) {
      if (node.uuid === uuid) {
        return node;
      }
    }
    return null;
  }

  /**
   * 计算所有节点的中心点
   */
  export function getCenter(): Vector {
    let center = Vector.getZero();
    for (const node of nodes) {
      center = center.add(node.rectangle.location);
    }
    return center.divide(nodes.length);
  }

  /**
   * 计算所有节点的大小
   */
  export function getSize(): Vector {
    if (nodes.length === 0) {
      return new Vector(Renderer.w, Renderer.h);
    }
    let size = Vector.getZero();
    for (const node of nodes) {
      if (node.rectangle.size.x > size.x) {
        size.x = node.rectangle.size.x;
      }
      if (node.rectangle.size.y > size.y) {
        size.y = node.rectangle.size.y;
      }
    }
    return size;
  }

  /**
   * 根据位置查找节点，常用于点击事件
   * @param location
   * @returns
   */
  export function findNodeByLocation(location: Vector): TextNode | null {
    for (const node of nodes) {
      if (node.rectangle.isPointInside(location)) {
        return node;
      }
    }
    return null;
  }

  /**
   * 用于鼠标悬停时查找边
   * @param location
   * @returns
   */
  export function findEdgeByLocation(location: Vector): Edge | null {
    for (const edge of edges) {
      if (edge.isBodyLineIntersectWithLocation(location)) {
        return edge;
      }
    }
    return null;
  }

  // region 以下为舞台操作相关的函数
  // 建议不同的功能分类到具体的文件中，然后最后集中到这里调用，使得下面的显示简短一些
  // 每个操作函数尾部都要加一个记录历史的操作

  /**
   *
   * @param clickWorldLocation
   * @returns 返回新创建节点的uuid
   */
  export async function addNodeByClick(
    clickWorldLocation: Vector,
  ): Promise<string> {
    const res = await StageNodeAdder.addNodeByClick(clickWorldLocation);
    StageHistoryManager.recordStep();
    return res;
  }

  /**
   * 拖动所有选中的节点一起移动
   * @param delta
   */
  export function moveNodes(delta: Vector) {
    StageNodeMoveManager.moveNodes(delta); // 连续过程，不记录历史，只在结束时记录
  }

  export function moveNodesWithChildren(delta: Vector) {
    StageNodeMoveManager.moveNodesWithChildren(delta); // 连续过程，不记录历史，只在结束时记录
  }

  export function alignLeft() {
    StageNodeMoveManager.alignLeft();
    StageHistoryManager.recordStep();
  }

  export function alignRight() {
    StageNodeMoveManager.alignRight();
    StageHistoryManager.recordStep();
  }

  export function alignTop() {
    StageNodeMoveManager.alignTop();
    StageHistoryManager.recordStep();
  }
  export function alignBottom() {
    StageNodeMoveManager.alignBottom();
    StageHistoryManager.recordStep();
  }
  export function alignCenterHorizontal() {
    StageNodeMoveManager.alignCenterHorizontal();
    StageHistoryManager.recordStep();
  }
  export function alignCenterVertical() {
    StageNodeMoveManager.alignCenterVertical();
    StageHistoryManager.recordStep();
  }
  export function alignHorizontalSpaceBetween() {
    StageNodeMoveManager.alignHorizontalSpaceBetween();
    StageHistoryManager.recordStep();
  }
  export function alignVerticalSpaceBetween() {
    StageNodeMoveManager.alignVerticalSpaceBetween();
    StageHistoryManager.recordStep();
  }

  export function setNodeColor(color: Color) {
    StageNodeColorManager.setNodeColor(color);
    StageHistoryManager.recordStep();
  }

  export function clearNodeColor() {
    StageNodeColorManager.clearNodeColor();
    StageHistoryManager.recordStep();
  }

  export function moveNodeFinished() {
    // 以后有历史记录和撤销功能了再说，这里什么都不用写
    // 需要查看ts的装饰器怎么用
    StageHistoryManager.recordStep();
  }

  export function moveEdgeFinished() {
    // 以后有历史记录和撤销功能了再说，这里什么都不用写
    // 需要查看ts的装饰器怎么用
    StageHistoryManager.recordStep();
  }

  /**
   * 通过拖拽边的方式来旋转节点
   * @param lastMoveLocation
   * @param diffLocation
   */
  export function moveEdges(lastMoveLocation: Vector, diffLocation: Vector) {
    StageNodeRotate.moveEdges(lastMoveLocation, diffLocation); // 连续过程，不记录历史，只在结束时记录
  }

  /**
   * 单独对一个节点，滚轮旋转
   * @param node
   * @param angle
   */
  export function rotateNode(node: TextNode, angle: number) {
    StageNodeRotate.rotateNodeDfs(node, node, angle, []); // 连续过程，不记录历史，只在结束时记录
    updateReferences();
  }

  export function deleteNodes(deleteNodes: TextNode[]) {
    StageDeleteManager.deleteNodes(deleteNodes);
    StageHistoryManager.recordStep();
    // 更新选中节点计数
    selectedNodeCount = 0;
    for (const node of nodes) {
      if (node.isSelected) {
        selectedNodeCount++;
      }
    }
    
  }

  export function deleteEdge(deleteEdge: Edge): boolean {
    const res = StageDeleteManager.deleteEdge(deleteEdge);
    StageHistoryManager.recordStep();
    // 更新选中边计数
    selectedEdgeCount = 0;
    for (const edge of edges) {
      if (edge.isSelected) {
        selectedEdgeCount++;
      }
    }
    return res;
  }

  export function connectNode(fromNode: TextNode, toNode: TextNode) {
    StageNodeConnector.connectNode(fromNode, toNode);
    StageHistoryManager.recordStep();
    return isConnected(fromNode, toNode);
  }

  export function reverseEdges(edges: Edge[]) {
    StageNodeConnector.reverseEdges(edges);
    StageHistoryManager.recordStep();
  }

  export function addSerializedData(
    serializedData: Serialized.File,
    diffLocation = new Vector(0, 0),
  ) {
    StageSerializedAdder.addSerializedData(serializedData, diffLocation);
    StageHistoryManager.recordStep();
  }

  export function clearClipboard() {
    Stage.copyBoardData = {
      version: StageDumper.latestVersion,
      nodes: [],
      edges: [],
    };
  }

  export function generateNodeByText(text: string, indention: number = 4) {
    StageNodeAdder.addNodeByText(text, indention);
  }
}
