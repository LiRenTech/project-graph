import { Edge } from "../Edge";
import { Node } from "../Node";
import { StageManager } from "./stageManager/StageManager";

/**
 * 将舞台信息转化为序列化JSON对象
 */
export namespace StageDumper {
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
      isColorSetByUser: node.isColorSetByUser,
      userColor: [node.userColor.r, node.userColor.g, node.userColor.b],
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
      nodes: StageManager.nodes.map((node) => dumpNodeToV3(node)),
      edges: StageManager.edges.map((edge) => dumpEdgeToV3(edge)),
    };
  }
}
