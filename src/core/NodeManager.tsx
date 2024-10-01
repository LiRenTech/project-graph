import { Edge } from "./Edge";
import { Node } from "./Node";
import { Vector } from "./Vector";
import { v4 as uuidv4 } from "uuid";

// 应该改成类，实例化的对象绑定到舞台上。这成单例模式了
// 开发过程中会造成多开
export namespace NodeManager {
  export const nodes: Node[] = [];
  export const edges: Edge[] = [];

  export function addNode(node: Node) {
    nodes.push(node);
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

  export function addNodeByClick(clickWorldLocation: Vector) {
    NodeManager.addNode(
      new Node({
        uuid: uuidv4(),
        text: "...",
        details: "",
        children: [],
        shape: {
          type: "Rectangle",
          location: [clickWorldLocation.x, clickWorldLocation.y],
          size: [100, 100],
        },
      }),
    );
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
