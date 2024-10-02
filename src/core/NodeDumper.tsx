import { Edge } from "./Edge";
import { Node } from "./Node";
import { NodeManager } from "./NodeManager";

/**
 * 把Node对象转化为序列化JSON对象
 *
 * 为什么Node转序列化的功能不放在Node类中？
 * 可能是因为它和NodeLoader恰好是相反的，而NodeLoader又有版本转换功能
 * 所以这里相当于是一个镜像
 *
 * 或许应该叫 StageDumper ?
 */
export namespace NodeDumper {
  export function dumpNodeToV3(node: Node): Record<string, any> {
    return {
      shape: {
        location: [node.rectangle.location.x, node.rectangle.location.y],
        size: [node.rectangle.size.x, node.rectangle.size.y],
      },
      text: node.text,
      uuid: node.uuid,
      details: node.details,
      children: node.children.map((child) => child.uuid),
    };
  }

  export function dumpEdgeToV3(edge: Edge): Record<string, any> {
    return {
      source: edge.source.uuid,
      target: edge.target.uuid,
      text: edge.text,
    };
  }

  export function dumpToV3(): Record<string, any> {
    return {
      version: 3,
      nodes: NodeManager.nodes.map((node) => dumpNodeToV3(node)),
      edges: NodeManager.edges.map((edge) => dumpEdgeToV3(edge)),
    };
  }
}
