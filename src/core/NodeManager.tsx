import { Edge } from "./Edge";
import { Node } from "./Node";

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
