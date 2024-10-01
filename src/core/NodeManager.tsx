import { Edge } from "./Edge";
import { Node } from "./Node";
import { Renderer } from "./render/canvas2d/renderer";
import { Vector } from "./Vector";
import { v4 as uuidv4 } from "uuid";

// littlefean:应该改成类，实例化的对象绑定到舞台上。这成单例模式了
// 开发过程中会造成多开
// zty012:这个是存储数据的，和舞台无关，应该单独抽离出来
// 并且会在舞台之外的地方操作，所以应该是namespace单例
export namespace NodeManager {
  export const nodes: Node[] = [];
  export const edges: Edge[] = [];

  export function addNode(node: Node) {
    nodes.push(node);
  }

  export function addEdge(edge: Edge) {
    edges.push(edge);
  }

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

  export function addNodeByClick(clickWorldLocation: Vector) {
    const node = new Node({
      uuid: uuidv4(),
      text: "...",
      details: "",
      children: [],
      shape: {
        type: "Rectangle",
        location: [clickWorldLocation.x, clickWorldLocation.y],
        size: [100, 100],
      },
    });
    // 将node本身向左上角移动，使其居中
    node.rectangle.location = node.rectangle.location.subtract(
      node.rectangle.size.divide(2),
    );
    NodeManager.addNode(node);
  }
  
  export function moveNodes(delta: Vector) {
    for (const node of nodes) {
      if (node.isSelected) {
        node.move(delta);
      }
    }
  }

  export function moveNodeFinished() {
    // 以后有历史记录了再说，这里什么都不用写
    // 需要查看ts的装饰器怎么用
  }

  /**
   * 重命名节点
   * @param node
   * @param text
   */
  export function renameNode(node: Node, text: string) {
    node.rename(text);
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
   * 销毁函数
   * 以防开发过程中造成多开
   */
  export function destroy() {
    NodeManager.nodes.splice(0, NodeManager.nodes.length);
    NodeManager.edges.splice(0, NodeManager.edges.length);
  }
}
