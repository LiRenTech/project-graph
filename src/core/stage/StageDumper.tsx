import { Serialized } from "../../types/node";
import { StageManager } from "./stageManager/StageManager";
import { Entity } from "./stageObject/abstract/StageEntity";
import { CublicCatmullRomSplineEdge } from "./stageObject/association/CublicCatmullRomSplineEdge";
import { LineEdge } from "./stageObject/association/LineEdge";
import { ConnectPoint } from "./stageObject/entity/ConnectPoint";
import { ImageNode } from "./stageObject/entity/ImageNode";
import { Section } from "./stageObject/entity/Section";
import { TextNode } from "./stageObject/entity/TextNode";
import { UrlNode } from "./stageObject/entity/UrlNode";

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
  export function dumpCrEdge(edge: CublicCatmullRomSplineEdge): Serialized.CublicCatmullRomSplineEdge {
    return {
      source: edge.source.uuid,
      target: edge.target.uuid,
      text: edge.text,
      uuid: edge.uuid,
      type: "core:cublic_catmull_rom_spline_edge",
      controlPoints: edge.getControlPoints().map((point) => [point.x, point.y]),
      alpha: edge.alpha,
      tension: edge.tension,
    };
  }
  export function dumpConnectPoint(connectPoint: ConnectPoint): Serialized.ConnectPoint {
    return {
      location: [connectPoint.geometryCenter.x, connectPoint.geometryCenter.y],
      uuid: connectPoint.uuid,
      type: "core:connect_point",
      details: connectPoint.details,
    };
  }

  export function dumpImageNode(imageNode: ImageNode): Serialized.ImageNode {
    return {
      location: [imageNode.rectangle.location.x, imageNode.rectangle.location.y],
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
   * 不递归（不包含section内部孩子）的序列化一个实体。
   * @param entity
   * @returns
   */
  export function dumpOneEntity(
    entity: Entity,
  ): Serialized.Section | Serialized.Node | Serialized.ConnectPoint | Serialized.ImageNode | Serialized.UrlNode {
    if (entity instanceof TextNode) {
      return dumpTextNode(entity);
    } else if (entity instanceof Section) {
      return dumpSection(entity);
    } else if (entity instanceof ConnectPoint) {
      return dumpConnectPoint(entity);
    } else if (entity instanceof ImageNode) {
      return dumpImageNode(entity);
    } else if (entity instanceof UrlNode) {
      return dumpUrlNode(entity);
    } else {
      throw new Error(`未知的实体类型: ${entity}`);
    }
  }

  // ------------------------------------------------------------

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
    )[] = [];
    for (const entity of StageManager.getEntities()) {
      entities.push(dumpOneEntity(entity));
    }

    const associations: (Serialized.LineEdge | Serialized.CublicCatmullRomSplineEdge)[] = [];
    for (const edge of StageManager.getAssociations()) {
      if (edge instanceof LineEdge) {
        associations.push(dumpEdge(edge));
      } else if (edge instanceof CublicCatmullRomSplineEdge) {
        associations.push(dumpCrEdge(edge));
      }
    }

    return {
      version: latestVersion,
      entities,
      associations,
      tags: StageManager.TagOptions.getTagUUIDs(),
    };
  }

  /**
   * 只将一部分选中的节点，以及它们之间的边转化为序列化JSON对象
   * @param entities 选中的节点
   * @returns
   */
  export function dumpSelected(entities: Entity[]): Serialized.File {
    // 根据选中的实体，找到涉及的边
    const selectedAssociations: (Serialized.LineEdge | Serialized.CublicCatmullRomSplineEdge)[] =
      dumpAssociationsByEntities(entities);

    return {
      version: latestVersion,
      entities: dumpEntities(entities),
      associations: selectedAssociations,
      tags: [],
    };
  }

  function dumpEntities(
    entities: Entity[],
  ): (Serialized.Section | Serialized.Node | Serialized.ConnectPoint | Serialized.ImageNode | Serialized.UrlNode)[] {
    //
    let selectedEntities: (
      | Serialized.Section
      | Serialized.Node
      | Serialized.ConnectPoint
      | Serialized.ImageNode
      | Serialized.UrlNode
    )[] = entities.filter((entity) => entity instanceof TextNode).map((node) => dumpTextNode(node));

    // 遍历所有section的时候，要把section的子节点递归的加入进来。
    const addSection = (section: Section) => {
      selectedEntities.push(dumpSection(section));
      for (const childEntity of section.children) {
        if (childEntity instanceof Section) {
          addSection(childEntity);
        } else {
          selectedEntities.push(dumpOneEntity(childEntity));
        }
      }
    };
    for (const section of entities.filter((entity) => entity instanceof Section)) {
      addSection(section);
    }

    selectedEntities = selectedEntities.concat(
      ...entities
        .filter((entity) => entity instanceof ConnectPoint)
        .map((connectPoint) => dumpConnectPoint(connectPoint)),
    );
    selectedEntities = selectedEntities.concat(
      ...entities.filter((entity) => entity instanceof ImageNode).map((node) => dumpImageNode(node)),
    );
    selectedEntities = selectedEntities.concat(
      ...entities.filter((entity) => entity instanceof UrlNode).map((node) => dumpUrlNode(node)),
    );
    return selectedEntities;
  }

  /**
   *
   * @param entities 注意：是通过dfs展平后的
   * @returns
   */
  function dumpAssociationsByEntities(
    entities: Entity[],
  ): (Serialized.LineEdge | Serialized.CublicCatmullRomSplineEdge)[] {
    // 准备答案数组
    const result: (Serialized.LineEdge | Serialized.CublicCatmullRomSplineEdge)[] = [];
    // 生成
    for (const edge of StageManager.getAssociations()) {
      if (edge instanceof LineEdge) {
        if (entities.includes(edge.source) && entities.includes(edge.target)) {
          result.push(dumpEdge(edge));
        }
      } else if (edge instanceof CublicCatmullRomSplineEdge) {
        if (entities.includes(edge.source) && entities.includes(edge.target)) {
          result.push(dumpCrEdge(edge));
        }
      }
    }

    return result;
  }
}
