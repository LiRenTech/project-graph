import { Edge } from "./Edge";
import { Node } from "./Node";

// 应该改成类，实例化的对象绑定到舞台上。这成单例模式了
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
}
