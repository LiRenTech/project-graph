import { Renderer } from "../../render/canvas2d/renderer";
import { GraphMethods } from "../../stage/stageManager/basicMethods/GraphMethods";
import { SectionMethods } from "../../stage/stageManager/basicMethods/SectionMethods";
import { StageManager } from "../../stage/stageManager/StageManager";
import { LineEdge } from "../../stage/stageObject/association/LineEdge";
import { ConnectPoint } from "../../stage/stageObject/entity/ConnectPoint";
import { ImageNode } from "../../stage/stageObject/entity/ImageNode";
import { PenStroke } from "../../stage/stageObject/entity/PenStroke";
import { Section } from "../../stage/stageObject/entity/Section";
import { TextNode } from "../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../stage/stageObject/entity/UrlNode";

export interface CountResultObject {
  textNodeWordCount: number;
  associationWordCount: number;
  entityDetailsWordCount: number;
  textCharSize: number;

  averageWordCountPreTextNode: number;

  entityCount: number;

  sectionCount: number;
  textNodeCount: number;
  penStrokeCount: number;
  imageCount: number;
  urlCount: number;
  connectPointCount: number;
  isolatedConnectPointCount: number;

  noTransparentEntityColorCount: number;
  transparentEntityColorCount: number;
  entityColorTypeCount: number;
  noTransparentEdgeColorCount: number;
  transparentEdgeColorCount: number;
  edgeColorTypeCount: number;

  stageWidth: number;
  stageHeight: number;
  stageArea: number;

  associationCount: number;
  selfLoopCount: number;
  isolatedConnectableEntityCount: number;
  multiEdgeCount: number;

  entityDensity: number;
  entityOverlapCount: number;

  crossEntityCount: number;
  maxSectionDepth: number;
  emptySetCount: number;
}
/**
 * 舞台场景复杂度检测器
 */
export namespace ComplexityDetector {
  /**
   * 检测当前舞台
   */
  export function detectorCurrentStage(): CountResultObject {
    // 统计字数
    // 统计各种类型节点数量
    const entities = StageManager.getEntities();
    const associations = StageManager.getAssociations();

    const countResultObject: CountResultObject = {
      // 小白统计
      textNodeWordCount: 0,
      associationWordCount: 0,
      entityDetailsWordCount: 0,
      averageWordCountPreTextNode: 0,
      textCharSize: 0,

      // 各种实体
      entityCount: entities.length,

      sectionCount: 0,
      textNodeCount: 0,
      penStrokeCount: 0,
      imageCount: 0,
      urlCount: 0,
      connectPointCount: 0,
      isolatedConnectPointCount: 0,

      // 颜色统计
      noTransparentEntityColorCount: 0,
      transparentEntityColorCount: 0,
      entityColorTypeCount: 0,
      noTransparentEdgeColorCount: 0,
      transparentEdgeColorCount: 0,
      edgeColorTypeCount: 0,

      // 舞台尺寸相关
      stageWidth: 0,
      stageHeight: 0,
      stageArea: 0,

      // 图论相关
      associationCount: associations.length,
      // 自环数量
      selfLoopCount: 0,
      // 孤立节点数量
      isolatedConnectableEntityCount: 0,
      multiEdgeCount: 0, // 多条边数量

      // 节点密度
      entityDensity: NaN,
      // 节点重叠数量
      entityOverlapCount: 0,

      // 集合论相关
      // 空集数量
      emptySetCount: 0,
      // 交叉元素数量
      crossEntityCount: 0,
      // 最大深度
      maxSectionDepth: 0,
    };

    // 各种实体统计
    for (const entity of entities) {
      countResultObject.entityDetailsWordCount += entity.details.length;

      if (entity instanceof TextNode) {
        countResultObject.textNodeWordCount += entity.text.length;
        countResultObject.averageWordCountPreTextNode += entity.text.length;
        countResultObject.textNodeCount++;
        if (entity.color.a === 0) {
          countResultObject.transparentEntityColorCount++;
        } else {
          countResultObject.noTransparentEntityColorCount++;
        }
      } else if (entity instanceof ImageNode) {
        countResultObject.imageCount++;
      } else if (entity instanceof UrlNode) {
        countResultObject.urlCount++;
      } else if (entity instanceof ConnectPoint) {
        countResultObject.connectPointCount++;
        if (GraphMethods.nodeChildrenArray(entity).length === 0 && GraphMethods.nodeParentArray(entity).length === 0) {
          countResultObject.isolatedConnectPointCount++;
        }
      } else if (entity instanceof PenStroke) {
        countResultObject.penStrokeCount++;
      } else if (entity instanceof Section) {
        countResultObject.sectionCount++;
        if (entity.color.a === 0) {
          countResultObject.transparentEntityColorCount++;
        } else {
          countResultObject.noTransparentEntityColorCount++;
        }
      }
    }
    countResultObject.averageWordCountPreTextNode /= countResultObject.textNodeCount;
    countResultObject.averageWordCountPreTextNode = Math.round(countResultObject.averageWordCountPreTextNode);

    const worldViewRectangle = Renderer.getCoverWorldRectangle();
    countResultObject.stageWidth = worldViewRectangle.width;
    countResultObject.stageHeight = worldViewRectangle.height;
    countResultObject.stageArea = worldViewRectangle.width * worldViewRectangle.height;

    // 遍历关系
    for (const association of associations) {
      if (association instanceof LineEdge) {
        if (association.source === association.target) {
          countResultObject.selfLoopCount++;
        } else {
          // 检测是否有多重边
          const edges = GraphMethods.getEdgesBetween(association.source, association.target);
          if (edges.length > 1) {
            countResultObject.multiEdgeCount++;
          }
        }
        countResultObject.associationWordCount += association.text.length;
      }
    }

    const connectableEntities = StageManager.getConnectableEntity();

    // 孤立节点数量
    for (const entity of connectableEntities) {
      if (GraphMethods.nodeChildrenArray(entity).length === 0 && GraphMethods.nodeParentArray(entity).length === 0) {
        countResultObject.isolatedConnectableEntityCount++;
      }
      const edges = GraphMethods.getEdgesBetween(entity, entity);
      if (edges.length > 1) {
        countResultObject.multiEdgeCount++;
      }
    }

    // 节点密度
    countResultObject.entityDensity = countResultObject.entityCount / (countResultObject.stageArea / 10000);

    // 节点重叠数量
    for (const entity of entities) {
      if (entity instanceof Section) {
        continue;
      }
      for (const otherEntity of entities) {
        if (entity === otherEntity || otherEntity instanceof Section) {
          continue;
        }
        if (entity.collisionBox.isIntersectsWithRectangle(otherEntity.collisionBox.getRectangle())) {
          countResultObject.entityOverlapCount++;
          break;
        }
      }
    }
    // 色彩统计
    const entityColorStringSet = new Set();
    for (const entity of entities) {
      if (entity instanceof TextNode || entity instanceof Section) {
        entityColorStringSet.add(entity.color.toString());
      }
    }
    countResultObject.entityColorTypeCount = entityColorStringSet.size;

    const edgeColorStringSet = new Set();
    for (const lineEdge of StageManager.getLineEdges()) {
      if (lineEdge.color.a === 0) {
        countResultObject.transparentEdgeColorCount++;
      } else {
        countResultObject.noTransparentEdgeColorCount++;
      }
      edgeColorStringSet.add(lineEdge.color.toString());
    }
    countResultObject.edgeColorTypeCount = edgeColorStringSet.size;
    // 集合论相关
    for (const entity of entities) {
      const fatherSections = SectionMethods.getFatherSections(entity);
      if (fatherSections.length > 1) {
        countResultObject.crossEntityCount++;
      }
    }
    for (const section of StageManager.getSections()) {
      // SectionMethods.isTreePack(section);
      countResultObject.maxSectionDepth = Math.max(
        countResultObject.maxSectionDepth,
        SectionMethods.getSectionMaxDeep(section),
      );
      if (section.childrenUUIDs.length === 0) {
        countResultObject.emptySetCount++;
      }
    }
    return countResultObject;
  }
}
