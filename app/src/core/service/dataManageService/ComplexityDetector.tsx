import { Renderer } from "../../render/canvas2d/renderer";
import { StageManager } from "../../stage/stageManager/StageManager";
import { LineEdge } from "../../stage/stageObject/association/LineEdge";
import { ConnectPoint } from "../../stage/stageObject/entity/ConnectPoint";
import { ImageNode } from "../../stage/stageObject/entity/ImageNode";
import { PenStroke } from "../../stage/stageObject/entity/PenStroke";
import { Section } from "../../stage/stageObject/entity/Section";
import { TextNode } from "../../stage/stageObject/entity/TextNode";
import { UrlNode } from "../../stage/stageObject/entity/UrlNode";

export interface CountResultObject {
  wordCount: number;
  averageWordCountPreTextNode: number;

  entityCount: number;
  associationCount: number;

  sectionCount: number;
  textNodeCount: number;
  penStrokeCount: number;
  imageCount: number;
  urlCount: number;
  connectPointCount: number;
  isolatedConnectPointCount: number;

  noTransparentEntityColorCount: number;
  transparentEntityColorCount: number;

  stageWidth: number;
  stageHeight: number;
  stageArea: number;

  selfLoopCount: number;
  averageEntityOutEdgeCount: number;
  averageEntityInEdgeCount: number;
  entityClusterCount: number;
  entityDensity: number;
  entityOverlapCount: number;

  crossCount: number;
  maxDepth: number;
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
      wordCount: 0,
      averageWordCountPreTextNode: 0,

      // 各种实体
      entityCount: entities.length,
      associationCount: associations.length,

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

      // 舞台尺寸相关
      stageWidth: 0,
      stageHeight: 0,
      stageArea: 0,

      // 图论相关

      // 自环数量
      selfLoopCount: 0,
      // 平均节点出度数量
      averageEntityOutEdgeCount: 0,
      // 平均节点入度数量
      averageEntityInEdgeCount: 0,
      // 节点团数量
      entityClusterCount: 0,
      // 节点密度
      entityDensity: 0,
      // 节点重叠数量
      entityOverlapCount: 0,

      // 集合论相关

      // 交叉数量
      crossCount: 0,
      // 最大深度
      maxDepth: 0,
    };
    // 各种实体统计
    for (const entity of entities) {
      if (entity instanceof TextNode) {
        countResultObject.wordCount += entity.text.length;
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
        }
      }
    }

    return countResultObject;
  }
}
