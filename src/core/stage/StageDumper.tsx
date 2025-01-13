import { Serialized } from "../../types/node";
import { LineEdge } from "../stageObject/association/LineEdge";
import { ConnectPoint } from "../stageObject/entity/ConnectPoint";
import { ImageNode } from "../stageObject/entity/ImageNode";
import { Section } from "../stageObject/entity/Section";
import { TextNode } from "../stageObject/entity/TextNode";
import { UrlNode } from "../stageObject/entity/UrlNode";
import { Entity } from "../stageObject/StageObject";
import { StageManager } from "./stageManager/StageManager";

/**
 * 将舞台信息转化为序列化JSON对象
 */
export namespace StageDumper {
  /**
   * 最新版本
   */
  export const latestVersion = 13;

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

  export function dumpEdge(edge: LineEdge): Serialized.LineEdge {
    return {
      source: edge.source.uuid,
      target: edge.target.uuid,
      text: edge.text,
      uuid: edge.uuid,
      type: "core:line_edge",
    };
  }
  export function dumpConnectPoint(
    connectPoint: ConnectPoint,
  ): Serialized.ConnectPoint {
    return {
      location: [connectPoint.geometryCenter.x, connectPoint.geometryCenter.y],
      uuid: connectPoint.uuid,
      type: "core:connect_point",
      details: connectPoint.details,
    };
  }

  export function dumpImageNode(imageNode: ImageNode): Serialized.ImageNode {
    return {
      location: [
        imageNode.rectangle.location.x,
        imageNode.rectangle.location.y,
      ],
      size: [imageNode.rectangle.size.x, imageNode.rectangle.size.y],
      scale: imageNode.scaleNumber,
      path: imageNode.path,
      uuid: imageNode.uuid,
      type: "core:image_node",
      details: imageNode.details,
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
      details: section.details,
    };
  }

  export function dumpUrlNode(urlNode: UrlNode): Serialized.UrlNode {
    return {
      location: [urlNode.rectangle.location.x, urlNode.rectangle.location.y],
      size: [urlNode.rectangle.size.x, urlNode.rectangle.size.y],
      url: urlNode.url,
      title: urlNode.title,
      uuid: urlNode.uuid,
      type: "core:url_node",
      details: urlNode.details,
      color: urlNode.color && urlNode.color.toArray(),
    };
  }

  /**
   * 将整个舞台的全部信息转化为序列化JSON对象
   * @returns
   */
  export function dump(): Serialized.File {
    const entities: (
      | Serialized.Section
      | Serialized.Node
      | Serialized.ConnectPoint
      | Serialized.ImageNode
      | Serialized.UrlNode
    )[] = StageManager.getTextNodes().map((node) => dumpTextNode(node));

    entities.push(
      ...StageManager.getSections().map((section) => dumpSection(section)),
    );
    entities.push(
      ...StageManager.getConnectPoints().map((connectPoint) =>
        dumpConnectPoint(connectPoint),
      ),
    );
    entities.push(
      ...StageManager.getImageNodes().map((node) => dumpImageNode(node)),
    );
    entities.push(
      ...StageManager.getUrlNodes().map((node) => dumpUrlNode(node)),
    );

    return {
      version: latestVersion,
      entities,
      associations: StageManager.getEdges().map((edge) => dumpEdge(edge)),
      tags: StageManager.TagOptions.getTagUUIDs(),
    };
  }

  /**
   * 只将一部分选中的节点，以及它们之间的边转化为序列化JSON对象
   * @param nodes 选中的节点
   * @returns
   */
  export function dumpSelected(nodes: Entity[]): Serialized.File {
    let selectedNodes: (
      | Serialized.Section
      | Serialized.Node
      | Serialized.ConnectPoint
      | Serialized.ImageNode
      | Serialized.UrlNode
    )[] = nodes
      .filter((entity) => entity instanceof TextNode)
      .map((node) => dumpTextNode(node));

    selectedNodes = selectedNodes.concat(
      ...nodes
        .filter((entity) => entity instanceof Section)
        .map((section) => dumpSection(section)),
    );

    selectedNodes = selectedNodes.concat(
      ...nodes
        .filter((entity) => entity instanceof ConnectPoint)
        .map((connectPoint) => dumpConnectPoint(connectPoint)),
    );
    selectedNodes = selectedNodes.concat(
      ...nodes
        .filter((entity) => entity instanceof ImageNode)
        .map((node) => dumpImageNode(node)),
    );
    selectedNodes = selectedNodes.concat(
      ...nodes
        .filter((entity) => entity instanceof UrlNode)
        .map((node) => dumpUrlNode(node)),
    );

    // 根据选中的实体，找到涉及的边
    const selectedAssociations: (
      | Serialized.LineEdge
      | Serialized.CublicCatmullRomSplineEdge
    )[] = [];

    for (const edge of StageManager.getEdges()) {
      if (nodes.includes(edge.source) && nodes.includes(edge.target)) {
        selectedAssociations.push(dumpEdge(edge));
      }
    }

    return {
      version: latestVersion,
      entities: selectedNodes,
      associations: selectedAssociations,
      tags: [],
    };
  }
}
