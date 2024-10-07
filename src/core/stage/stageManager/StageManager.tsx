import { Color } from "../../dataStruct/Color";
import { Controller } from "../../controller/Controller";
import { Edge } from "../../Edge";
import { Node } from "../../Node";
import { Renderer } from "../../render/canvas2d/renderer";
import { Vector } from "../../dataStruct/Vector";
import { StageNodeRotate } from "./concreteMethods/stageNodeRotate";
import { StageNodeAdder } from "./concreteMethods/stageNodeAdder";
import { StageDeleteManager } from "./concreteMethods/StageDeleteManager";
import { StageNodeConnector } from "./concreteMethods/StageNodeConnector";
import { StageNodeMoveManager } from "./concreteMethods/StageNodeMoveManager";
import { StageNodeColorManager } from "./concreteMethods/StageNodeColorManager";

// littlefean:应该改成类，实例化的对象绑定到舞台上。这成单例模式了
// 开发过程中会造成多开
// zty012:这个是存储数据的，和舞台无关，应该单独抽离出来
// 并且会在舞台之外的地方操作，所以应该是namespace单例

/**
 * 舞台管理器，也可以看成包含了很多操作方法的《舞台实体容器》
 * 管理节点、边的关系等，内部包含了舞台上的所有实体
 */
export namespace StageManager {
  export const nodes: Node[] = [];
  export const edges: Edge[] = [];
  /**
   * 销毁函数
   * 以防开发过程中造成多开
   */
  export function destroy() {
    StageManager.nodes.splice(0, StageManager.nodes.length);
    StageManager.edges.splice(0, StageManager.edges.length);
  }

  export function addNode(node: Node) {
    nodes.push(node);
  }

  export function addEdge(edge: Edge) {
    edges.push(edge);
  }

  /**
   * 更新节点的引用，将unknown的节点替换为真实的节点，保证对象在内存中的唯一性
   * 节点什么情况下会是unknown的？
   *
   */
  export function updateReferences() {
    for (const node of nodes) {
      for (const otherNode of nodes) {
        for (const child of otherNode.children) {
          if (child.unknown && child.uuid === node.uuid) {
            otherNode.children.splice(otherNode.children.indexOf(child), 1);
            otherNode.children.push(child);
          }
        }
      }
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

  export function getNodeByUUID(uuid: string): Node | null {
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
  export function findNodeByLocation(location: Vector): Node | null {
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
      if (
        edge.bodyLine.isPointNearLine(location, Controller.edgeHoverTolerance)
      ) {
        return edge;
      }
    }
    return null;
  }

  // region 以下为舞台操作相关的函数
  // 建议不同的功能分类到具体的文件中，然后最后集中到这里调用，使得下面的显示简短一些

  /**
   * 
   * @param clickWorldLocation 
   * @returns 返回新创建节点的uuid
   */
  export function addNodeByClick(clickWorldLocation: Vector): string {
    return StageNodeAdder.addNodeByClick(clickWorldLocation);
  }

  /**
   * 拖动所有选中的节点一起移动
   * @param delta
   */
  export function moveNodes(delta: Vector) {
    StageNodeMoveManager.moveNodes(delta);
  }

  export function moveNodesWithChildren(delta: Vector) {
    StageNodeMoveManager.moveNodesWithChildren(delta);
  }

  export function setNodeColor(color: Color) {
    StageNodeColorManager.setNodeColor(color);
  }

  export function clearNodeColor() {
    StageNodeColorManager.clearNodeColor();
  }

  export function moveNodeFinished() {
    // 以后有历史记录和撤销功能了再说，这里什么都不用写
    // 需要查看ts的装饰器怎么用
  }

  export function moveEdgeFinished() {
    // 以后有历史记录和撤销功能了再说，这里什么都不用写
    // 需要查看ts的装饰器怎么用
  }

  /**
   * 通过拖拽边的方式来旋转节点
   * @param lastMoveLocation
   * @param diffLocation
   */
  export function moveEdges(lastMoveLocation: Vector, diffLocation: Vector) {
    StageNodeRotate.moveEdges(lastMoveLocation, diffLocation);
  }

  /**
   * 单独对一个节点，滚轮旋转
   * @param node
   * @param angle
   */
  export function rotateNode(node: Node, angle: number) {
    StageNodeRotate.rotateNodeDfs(node, node, angle, []);
    updateReferences();
  }

  export function deleteNodes(deleteNodes: Node[]) {
    StageDeleteManager.deleteNodes(deleteNodes);
  }

  export function deleteEdge(deleteEdge: Edge): boolean {
    return StageDeleteManager.deleteEdge(deleteEdge);
  }

  export function connectNode(fromNode: Node, toNode: Node): boolean {
    return StageNodeConnector.connectNode(fromNode, toNode);
  }
}
