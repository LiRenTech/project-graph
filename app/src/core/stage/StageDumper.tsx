import { Serialized } from "../../types/node";
import { SectionMethods } from "./stageManager/basicMethods/SectionMethods";
import { StageManager } from "./stageManager/StageManager";
import { Association } from "./stageObject/abstract/Association";
import { Entity } from "./stageObject/abstract/StageEntity";
import { CubicCatmullRomSplineEdge } from "./stageObject/association/CubicCatmullRomSplineEdge";
import { LineEdge } from "./stageObject/association/LineEdge";
import { MultiTargetUndirectedEdge } from "./stageObject/association/MutiTargetUndirectedEdge";
import { ConnectPoint } from "./stageObject/entity/ConnectPoint";
import { ImageNode } from "./stageObject/entity/ImageNode";
import { PenStroke } from "./stageObject/entity/PenStroke";
import { PortalNode } from "./stageObject/entity/PortalNode";
import { Section } from "./stageObject/entity/Section";
import { SvgNode } from "./stageObject/entity/SvgNode";
import { TextNode } from "./stageObject/entity/TextNode";
import { UrlNode } from "./stageObject/entity/UrlNode";

/**
 * 将舞台信息转化为序列化JSON对象
 */
export namespace StageDumper {
  /**
   * 最新版本
   */
  export const latestVersion = 17;

  export function dumpTextNode(textNode: TextNode): Serialized.TextNode {
    return {
      location: [textNode.rectangle.location.x, textNode.rectangle.location.y],
      size: [textNode.rectangle.size.x, textNode.rectangle.size.y],
      text: textNode.text,
      uuid: textNode.uuid,
      details: textNode.details,
      color: textNode.color && textNode.color.toArray(),
      type: "core:text_node",
      sizeAdjust: textNode.sizeAdjust,
    };
  }

  export function dumpEdge(edge: LineEdge): Serialized.LineEdge {
    return {
      source: edge.source.uuid,
      target: edge.target.uuid,
      text: edge.text,
      uuid: edge.uuid,
      type: "core:line_edge",
      color: edge.color && edge.color.toArray(),
      sourceRectRate: [edge.sourceRectangleRate.x, edge.sourceRectangleRate.y],
      targetRectRate: [edge.targetRectangleRate.x, edge.targetRectangleRate.y],
    };
  }
  export function dumpCrEdge(edge: CubicCatmullRomSplineEdge): Serialized.CubicCatmullRomSplineEdge {
    return {
      source: edge.source.uuid,
      target: edge.target.uuid,
      text: edge.text,
      uuid: edge.uuid,
      type: "core:cubic_catmull_rom_spline_edge",
      controlPoints: edge.getControlPoints().map((point) => [point.x, point.y]),
      alpha: edge.alpha,
      tension: edge.tension,
      color: edge.color && edge.color.toArray(),
      sourceRectRate: [edge.sourceRectangleRate.x, edge.sourceRectangleRate.y],
      targetRectRate: [edge.targetRectangleRate.x, edge.targetRectangleRate.y],
    };
  }
  export function dumpMTUEdge(edge: MultiTargetUndirectedEdge): Serialized.MultiTargetUndirectedEdge {
    return {
      type: "core:multi_target_undirected_edge",
      targets: edge.targetUUIDs,
      color: edge.color && edge.color.toArray(),
      rectRates: edge.rectRates.map((v) => v.toArray()),
      uuid: edge.uuid,
      text: edge.text,
      arrow: edge.arrow,
      centerRate: edge.centerRate.toArray(),
      padding: edge.padding,
      renderType: edge.renderType,
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
  export function dumpPenStroke(penStroke: PenStroke): Serialized.PenStroke {
    return {
      content: penStroke.dumpString(),
      uuid: penStroke.uuid,
      details: penStroke.details,
      location: [penStroke.getPath()[0].x, penStroke.getPath()[0].y],
      type: "core:pen_stroke",
      color: penStroke.getColor().toArray(),
    };
  }
  export function dumpPortalNode(portalNode: PortalNode): Serialized.PortalNode {
    return {
      location: [portalNode.location.x, portalNode.location.y],
      portalFilePath: portalNode.portalFilePath,
      targetLocation: [portalNode.targetLocation.x, portalNode.targetLocation.y],
      cameraScale: portalNode.cameraScale,
      title: portalNode.title,
      size: [portalNode.size.x, portalNode.size.y],
      color: portalNode.color && portalNode.color.toArray(),
      uuid: portalNode.uuid,
      type: "core:portal_node",
      details: portalNode.details,
    };
  }
  export function dumpSvgNode(svgNode: SvgNode): Serialized.SvgNode {
    const rect = svgNode.collisionBox.getRectangle();
    return {
      location: [rect.location.x, rect.location.y],
      size: [rect.size.x, rect.size.y],
      content: svgNode.content,
      uuid: svgNode.uuid,
      color: svgNode.color.toArray(),
      scale: svgNode.scaleNumber,
      type: "core:svg_node",
      details: svgNode.details,
    };
  }
  /**
   * 不递归（不包含section内部孩子）的序列化一个实体。
   * @param entity
   * @returns
   */
  export function dumpOneEntity(entity: Entity): Serialized.CoreEntity {
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
    } else if (entity instanceof PenStroke) {
      return dumpPenStroke(entity);
    } else if (entity instanceof PortalNode) {
      return dumpPortalNode(entity);
    } else if (entity instanceof SvgNode) {
      return dumpSvgNode(entity);
    } else {
      throw new Error(`未知的实体类型: ${entity}`);
    }
  }

  export function dumpOneAssociation(association: Association): Serialized.CoreAssociation {
    if (association instanceof LineEdge) {
      return dumpEdge(association);
    } else if (association instanceof CubicCatmullRomSplineEdge) {
      return dumpCrEdge(association);
    } else if (association instanceof MultiTargetUndirectedEdge) {
      return dumpMTUEdge(association);
    } else {
      throw new Error(`未知的关联类型: ${association}`);
    }
  }

  // ------------------------------------------------------------

  /**
   * 将整个舞台的全部信息转化为序列化JSON对象
   * @returns
   */
  export function dump(): Serialized.File {
    const entities: Serialized.CoreEntity[] = [];
    for (const entity of StageManager.getEntities()) {
      entities.push(dumpOneEntity(entity));
    }

    const associations: Serialized.CoreAssociation[] = [];
    for (const edge of StageManager.getAssociations()) {
      associations.push(dumpOneAssociation(edge));
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
    const dumpedEntities = dumpEntities(entities);

    // 根据选中的实体，找到涉及的边
    const selectedAssociations: Serialized.CoreAssociation[] = dumpAssociationsByEntities(
      SectionMethods.getAllEntitiesInSelectedSectionsOrEntities(entities),
    );

    return {
      version: latestVersion,
      entities: dumpedEntities,
      associations: selectedAssociations,
      tags: [],
    };
  }

  function dumpEntities(entities: Entity[]): Serialized.CoreEntity[] {
    //
    let selectedEntities: Serialized.CoreEntity[] = entities
      .filter((entity) => entity instanceof TextNode)
      .map((node) => dumpTextNode(node));

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
  function dumpAssociationsByEntities(entities: Entity[]): Serialized.CoreAssociation[] {
    // 准备答案数组
    const result: Serialized.CoreAssociation[] = [];
    // 生成
    for (const edge of StageManager.getAssociations()) {
      if (edge instanceof LineEdge) {
        if (entities.includes(edge.source) && entities.includes(edge.target)) {
          result.push(dumpEdge(edge));
        }
      } else if (edge instanceof CubicCatmullRomSplineEdge) {
        if (entities.includes(edge.source) && entities.includes(edge.target)) {
          result.push(dumpCrEdge(edge));
        }
      } else if (edge instanceof MultiTargetUndirectedEdge) {
        const connectedEntities = edge.associationList;
        // 需要全部包含，才能算是连接的
        if (connectedEntities.every((entity) => entities.includes(entity))) {
          result.push(dumpMTUEdge(edge));
        }
      }
    }

    return result;
  }
}
