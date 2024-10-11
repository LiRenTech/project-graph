import { Serialized } from "../../types/node";
import { Edge } from "../Edge";
import { Node } from "../Node";
import { StageManager } from "./stageManager/StageManager";

/**
 * 将舞台信息转化为序列化JSON对象
 */
export namespace StageDumper {
  export function dumpNode(node: Node): Serialized.Node {
    return {
      location: [node.rectangle.location.x, node.rectangle.location.y],
      size: [node.rectangle.size.x, node.rectangle.size.y],
      text: node.text,
      uuid: node.uuid,
      details: node.details,
      children: node.children.map((child) => child.uuid),
      color: node.color && node.color.toArray(),
    };
  }

  export function dumpEdge(edge: Edge): Serialized.Edge {
    return {
      source: edge.source.uuid,
      target: edge.target.uuid,
      text: edge.text,
    };
  }

  export function dump(): Serialized.File {
    return {
      version: 4,
      nodes: StageManager.nodes.map((node) => dumpNode(node)),
      edges: StageManager.edges.map((edge) => dumpEdge(edge)),
    };
  }
}
