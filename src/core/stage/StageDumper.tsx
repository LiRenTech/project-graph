import { Serialized } from "../../types/node";
import { Edge } from "../stageObject/association/Edge";
import { ConnectPoint } from "../stageObject/entity/ConnectPoint";
import { ImageNode } from "../stageObject/entity/ImageNode";
import { Section } from "../stageObject/entity/Section";
import { TextNode } from "../stageObject/entity/TextNode";
import { Entity } from "../stageObject/StageObject";
import { StageManager } from "./stageManager/StageManager";

/**
 * 将舞台信息转化为序列化JSON对象
 */
export namespace StageDumper {
  /**
   * 最新版本
   */
  export const latestVersion = 9;

  export function dumpTextNode(textNode: TextNode): Serialized.Node {
    return {
      location: [textNode.rectangle.location.x, textNode.rectangle.location.y],
      size: [textNode.rectangle.size.x, textNode.rectangle.size.y],
      text: textNode.text,
      uuid: textNode.uuid,
      details: textNode.details,
      color: textNode.color && textNode.color.toArray(),
      type: "core:text_node",
    };
  }

  export function dumpEdge(edge: Edge): Serialized.Edge {
    return {
      source: edge.source.uuid,
      target: edge.target.uuid,
      text: edge.text,
      uuid: edge.uuid,
      type: "core:edge",
    };
  }
  export function dumpConnectPoint(
    connectPoint: ConnectPoint,
  ): Serialized.ConnectPoint {
    return {
      location: [connectPoint.geometryCenter.x, connectPoint.geometryCenter.y],
      uuid: connectPoint.uuid,
      type: "core:connect_point",
    };
  }

  export function dumpImageNode(imageNode: ImageNode): Serialized.ImageNode {
    return {
      location: [
        imageNode.rectangle.location.x,
        imageNode.rectangle.location.y,
      ],
      size: [imageNode.rectangle.size.x, imageNode.rectangle.size.y],
      path: imageNode.path,
      uuid: imageNode.uuid,
      type: "core:image_node",
    };
  }

  export function dumpSection(section: Section): Serialized.Section {
    return {
      location: [section.rectangle.location.x, section.rectangle.location.y],
      size: [section.rectangle.size.x, section.rectangle.size.y],
      uuid: section.uuid,
      text: section.text,
      color: section.color && section.color.toArray(),
      type: "core:section",
      isCollapsed: section.isCollapsed,
      isHidden: section.isHidden,
      children: section.children.map((child) => child.uuid),
    };
  }

  /**
   * 将整个舞台的全部信息转化为序列化JSON对象
   * @returns
   */
  export function dump(): Serialized.File {
    const nodes: (
      | Serialized.Section
      | Serialized.Node
      | Serialized.ConnectPoint
      | Serialized.ImageNode
    )[] = StageManager.getTextNodes().map((node) => dumpTextNode(node));

    nodes.push(
      ...StageManager.getSections().map((section) => dumpSection(section)),
    );
    nodes.push(
      ...StageManager.getConnectPoints().map((connectPoint) =>
        dumpConnectPoint(connectPoint),
      ),
    );
    nodes.push(
      ...StageManager.getImageNodes().map((node) => dumpImageNode(node)),
    );

    return {
      version: latestVersion,
      nodes,
      edges: StageManager.getEdges().map((edge) => dumpEdge(edge)),
    };
  }

  /**
   * 只将一部分选中的节点，以及它们之间的边转化为序列化JSON对象
   * @param nodes 选中的节点
   * @returns
   */
  export function dumpSelected(nodes: Entity[]): Serialized.File {
    const selectedNodes = nodes
      .filter((node) => node instanceof TextNode)
      .map((node) => dumpTextNode(node));
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
