import { Color } from "./dataStruct/Color";
import { Controller } from "./controller/Controller";
import { Edge } from "./Edge";
import { Node } from "./Node";
import { Renderer } from "./render/canvas2d/renderer";
import { Vector } from "./dataStruct/Vector";
import { v4 as uuidv4 } from "uuid";

// littlefean:应该改成类，实例化的对象绑定到舞台上。这成单例模式了
// 开发过程中会造成多开
// zty012:这个是存储数据的，和舞台无关，应该单独抽离出来
// 并且会在舞台之外的地方操作，所以应该是namespace单例

/**
 * 节点管理器
 */
export namespace NodeManager {
  export const nodes: Node[] = [];
  export const edges: Edge[] = [];

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

  export function setNodeColor(color: Color) {
    for (const node of nodes) {
      if (node.isSelected) {
        node.isColorSetByUser = true;
        node.userColor = color;
      }
    }
  }
  export function clearNodeColor() {
    for (const node of nodes) {
      if (node.isSelected) {
        node.isColorSetByUser = false;
      }
    }
  }

  export function moveNodeFinished() {
    // 以后有历史记录了再说，这里什么都不用写
    // 需要查看ts的装饰器怎么用
  }
  export function moveEdgeFinished() {
    // 以后有历史记录了再说，这里什么都不用写
    // 需要查看ts的装饰器怎么用
  }
  /**
   *
   * @param lastMoveLocation
   * @param diffLocation
   */
  export function moveEdges(lastMoveLocation: Vector, diffLocation: Vector) {
    for (const edge of edges) {
      if (edge.isSelected) {
        const startMouseDragLocation = lastMoveLocation.clone();
        const endMouseDragLocation = startMouseDragLocation.add(diffLocation);
        const vectorStart = startMouseDragLocation.subtract(
          edge.source.rectangle.center,
        );
        const vectorEnd = endMouseDragLocation.subtract(
          edge.source.rectangle.center,
        );
        let degrees = vectorStart.angleToSigned(vectorEnd);
        // degrees一直是正数
        console.log(degrees);
        if (Number.isNaN(degrees)) {
          degrees = 0;
        }
        // 2024年10月6日：发现打开文件后，旋转节点无法带动子树，只能传递一层。
        // rotateNodeDfs(edge.source, edge.target, degrees, [edge.source.uuid]);
        rotateNodeDfs(
          getNodeByUUID(edge.source.uuid)!,
          getNodeByUUID(edge.target.uuid)!,
          degrees,
          [edge.source.uuid],
        );
      }
    }
  }

  export function deleteNodes(deleteNodes: Node[]) {
    for (const node of deleteNodes) {
      // 先判断这个node是否在nodes里
      if (nodes.includes(node)) {
        console.log("include node", node.uuid);
        // 从数组中去除
        nodes.splice(nodes.indexOf(node), 1);
        console.log(nodes);
      } else {
        console.warn("node not in nodes", node.uuid);
      }
      // 不仅要删除节点本身，其他节点的child中也要删除该节点
      for (const fatherNode of nodes) {
        // if node in father_node.children
        if (fatherNode.children.includes(node)) {
          fatherNode.children.splice(fatherNode.children.indexOf(node), 1);
        }
      }
      // 删除所有相关的边
      const prepareDeleteEdges: Edge[] = [];
      for (const edge of edges) {
        if (edge.source === node || edge.target === node) {
          prepareDeleteEdges.push(edge);
        }
      }
      for (const edge of prepareDeleteEdges) {
        edges.splice(edges.indexOf(edge), 1);
      }
      console.log("delete node", node.uuid);
    }
    updateReferences();
  }

  export function deleteEdge(deleteEdge: Edge): boolean {
    const fromNode = deleteEdge.source;
    const toNode = deleteEdge.target;
    // 先判断这两个节点是否在nodes里
    if (nodes.includes(fromNode) && nodes.includes(toNode)) {
      // 从数组中去除
      const res = fromNode.removeChild(toNode);
      // 删除边
      edges.splice(edges.indexOf(deleteEdge), 1);
      return res;
    } else {
      console.log("node not in nodes");
      return false;
    }
  }

  export function rotateNode(node: Node, angle: number) {
    rotateNodeDfs(node, node, angle, []);
    updateReferences();
  }

  /**
   *
   * @param rotateCenterNode 递归开始的节点
   * @param currentNode 当前递归遍历到的节点
   * @param degrees 旋转角度
   * @param visitedUUIDs 已经访问过的节点的uuid列表，用于避免死循环
   */
  function rotateNodeDfs(
    rotateCenterNode: Node,
    currentNode: Node,
    degrees: number,
    visitedUUIDs: string[],
  ): void {
    const rotateCenterLocation = rotateCenterNode.rectangle.center;
    // 先旋转自己
    const radius = currentNode.rectangle.center.distance(rotateCenterLocation);
    let centerToChildVector = currentNode.rectangle.center
      .subtract(rotateCenterLocation)
      .normalize();
    centerToChildVector = centerToChildVector
      .rotateDegrees(degrees)
      .multiply(radius);
    const newLocation = rotateCenterLocation.add(centerToChildVector);
    currentNode.moveTo(
      newLocation.subtract(currentNode.rectangle.size.divide(2)),
    );
    // 再旋转子节点
    for (const child of currentNode.children) {
      if (visitedUUIDs.includes(child.uuid)) {
        continue;
      }
      rotateNodeDfs(
        rotateCenterNode,
        // 2024年10月6日：发现打开文件后，旋转节点无法带动子树，只能传递一层。
        // child,
        getNodeByUUID(child.uuid)!,
        degrees,
        visitedUUIDs.concat(currentNode.uuid),
      );
    }
  }

  export function connectNode(fromNode: Node, toNode: Node): boolean {
    if (nodes.includes(fromNode) && nodes.includes(toNode)) {
      const addResult = fromNode.addChild(toNode);
      const newEdge = new Edge({
        source: fromNode.uuid,
        target: toNode.uuid,
        text: "",
      });

      // TODO 双向线检测

      edges.push(newEdge);

      updateReferences();
      return addResult;
    }
    return false;
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

  export function getNodeByUUID(uuid: string): Node | null {
    for (const node of nodes) {
      if (node.uuid === uuid) {
        return node;
      }
    }
    return null;
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

  /**
   * 销毁函数
   * 以防开发过程中造成多开
   */
  export function destroy() {
    NodeManager.nodes.splice(0, NodeManager.nodes.length);
    NodeManager.edges.splice(0, NodeManager.edges.length);
  }
}
