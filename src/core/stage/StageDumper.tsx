import { Serialized } from "../../types/node";
import { Edge } from "../stageObject/association/Edge";
import { TextNode } from "../stageObject/entity/TextNode";
import { StageManager } from "./stageManager/StageManager";

/**
 * 将舞台信息转化为序列化JSON对象
 */
export namespace StageDumper {

  /**
   * 最新版本
   */
  export const latestVersion = 7;


  export function dumpNode(node: TextNode): Serialized.Node {
    return {
      location: [node.rectangle.location.x, node.rectangle.location.y],
      size: [node.rectangle.size.x, node.rectangle.size.y],
      text: node.text,
      uuid: node.uuid,
      details: node.details,
      color: node.color && node.color.toArray(),
    };
  }

  export function dumpEdge(edge: Edge): Serialized.Edge {
    return {
      source: edge.source.uuid,
      target: edge.target.uuid,
      text: edge.text,
      uuid: edge.uuid,
    };
  }

  /**
   * 将整个舞台的全部信息转化为序列化JSON对象
   * @returns
   */
  export function dump(): Serialized.File {
    return {
      version: latestVersion,
      nodes: StageManager.getTextNodes().map((node) => dumpNode(node)),
      edges: StageManager.getEdges().map((edge) => dumpEdge(edge)),
    };
  }

  /**
   * 只将一部分选中的节点，以及它们之间的边转化为序列化JSON对象
   * @param nodes 选中的节点
   * @returns
   */
  export function dumpSelected(nodes: TextNode[]): Serialized.File {
    const selectedNodes = nodes.map((node) => dumpNode(node));
    const selectedEdges: Serialized.Edge[] = [];
    
    for (const edge of StageManager.getEdges()) {
      if (nodes.includes(edge.source) && nodes.includes(edge.target)) {
        selectedEdges.push(dumpEdge(edge));
      }
    }

    return {
      version: latestVersion,
      nodes: selectedNodes,
      edges: selectedEdges,
    };
  }
}
