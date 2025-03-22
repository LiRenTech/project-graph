import React from "react";
import ReactDOMServer from "react-dom/server";
import { PathString } from "../../../../utils/pathString";
import { Color, colorInvert } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { EdgeRenderer } from "../../../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "../../../render/canvas2d/renderer";
import { SvgUtils } from "../../../render/svg/SvgUtils";
import { Stage } from "../../../stage/Stage";
import { SectionMethods } from "../../../stage/stageManager/basicMethods/SectionMethods";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Entity } from "../../../stage/stageObject/abstract/StageEntity";
import { LineEdge } from "../../../stage/stageObject/association/LineEdge";
import { ImageNode } from "../../../stage/stageObject/entity/ImageNode";
import { Section } from "../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { StageStyleManager } from "../../feedbackService/stageStyle/StageStyleManager";

export interface SvgExportConfig {
  imageMode: "absolutePath" | "relativePath" | "base64";
}

/**
 * 将舞台当前内容导出为SVG
 *
 *
 */
export namespace StageExportSvg {
  let svgConfig: SvgExportConfig = {
    imageMode: "relativePath",
  };

  export function setConfig(config: SvgExportConfig) {
    svgConfig = config;
  }

  export function dumpNode(node: TextNode) {
    if (node.isHiddenBySectionCollapse) {
      return <></>;
    }
    return (
      <>
        {SvgUtils.rectangle(node.rectangle, node.color, StageStyleManager.currentStyle.StageObjectBorder, 2)}

        {SvgUtils.multiLineTextFromLeftTop(
          node.text,
          node.rectangle.leftTop.add(
            // 2025年1月23日 晚上，对这个地方进行了微调，但还没弄懂原理，只是看上去像是加了点偏移
            // 着急发布节点多行文本的功能，所以先这样吧
            new Vector(0, Renderer.NODE_PADDING + Renderer.FONT_SIZE / 4),
          ),
          Renderer.FONT_SIZE,
          node.color.a === 1 ? colorInvert(node.color) : colorInvert(StageStyleManager.currentStyle.Background),
        )}
      </>
    );
  }

  /**
   * 渲染Section顶部颜色
   * @param section
   * @returns
   */
  export function dumpSection(section: Section) {
    if (section.isHiddenBySectionCollapse) {
      return <></>;
    }
    return (
      <>
        {SvgUtils.rectangle(section.rectangle, Color.Transparent, StageStyleManager.currentStyle.StageObjectBorder, 2)}
        {SvgUtils.textFromLeftTop(
          section.text,
          section.rectangle.leftTop,
          Renderer.FONT_SIZE,
          StageStyleManager.currentStyle.StageObjectBorder,
        )}
      </>
    );
  }

  /**
   * 只渲染Section的底部颜色
   * @param section
   * @returns
   */
  export function dumpSectionBase(section: Section) {
    if (section.isHiddenBySectionCollapse) {
      return <></>;
    }
    return <>{SvgUtils.rectangle(section.rectangle, section.color, Color.Transparent, 0)}</>;
  }

  export function dumpEdge(edge: LineEdge): React.ReactNode {
    return EdgeRenderer.getEdgeSvg(edge);
  }
  /**
   *
   * @param node
   * @param absolutePath 是否使用绝对路径
   * @returns
   */
  export function dumpImageNode(node: ImageNode, svgConfigObject: SvgExportConfig) {
    if (node.isHiddenBySectionCollapse) {
      return <></>;
    }
    let imagePath = node.path;
    if (svgConfigObject.imageMode === "absolutePath") {
      imagePath = PathString.dirPath(Stage.path.getFilePath()) + PathString.getSep() + node.path;
    }

    return (
      <>
        {SvgUtils.rectangle(node.rectangle, Color.Transparent, StageStyleManager.currentStyle.StageObjectBorder, 2)}
        <image
          href={imagePath}
          x={node.rectangle.leftTop.x}
          y={node.rectangle.leftTop.y}
          width={node.rectangle.size.x}
          height={node.rectangle.size.y}
        />
      </>
    );
  }

  function getEntitiesOuterRectangle(entities: Entity[], padding: number): Rectangle {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const entity of entities) {
      if (entity.collisionBox.getRectangle().location.x < minX) {
        minX = entity.collisionBox.getRectangle().location.x - padding;
      }
      if (entity.collisionBox.getRectangle().location.y < minY) {
        minY = entity.collisionBox.getRectangle().location.y - padding;
      }
      if (entity.collisionBox.getRectangle().location.x + entity.collisionBox.getRectangle().size.x > maxX) {
        maxX = entity.collisionBox.getRectangle().location.x + entity.collisionBox.getRectangle().size.x + padding;
      }
      if (entity.collisionBox.getRectangle().location.y + entity.collisionBox.getRectangle().size.y > maxY) {
        maxY = entity.collisionBox.getRectangle().location.y + entity.collisionBox.getRectangle().size.y + padding;
      }
    }
    return new Rectangle(new Vector(minX, minY), new Vector(maxX - minX, maxY - minY));
  }

  function dumpSelected(): React.ReactNode {
    const selectedEntities = StageManager.getSelectedEntities();
    if (selectedEntities.length === 0) {
      return "";
    }
    const padding = 30; // 留白
    const viewRectangle = getEntitiesOuterRectangle(selectedEntities, padding);
    // 计算画布的大小
    const width = viewRectangle.size.x;
    const height = viewRectangle.size.y;
    // 计算画布的 viewBox
    const viewBox = `${viewRectangle.location.x} ${viewRectangle.location.y} ${width} ${height}`;
    // fix:bug section选中了，但是内部的东西没有追加进入
    const newEntities = SectionMethods.getAllEntitiesInSelectedSectionsOrEntities(selectedEntities);
    // 合并两个数组并更新
    for (const entity of newEntities) {
      if (selectedEntities.indexOf(entity) === -1) {
        selectedEntities.push(entity);
      }
    }
    // 所有实际包含的uuid集合
    const selectedEntitiesUUIDSet = new Set<string>();
    for (const entity of selectedEntities) {
      selectedEntitiesUUIDSet.add(entity.uuid);
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox={viewBox}
        style={{
          backgroundColor: StageStyleManager.currentStyle.Background.toString(),
        }}
      >
        {/* 选中的部分 */}
        {SectionMethods.getSortedSectionsByZ(selectedEntities.filter((entity) => entity instanceof Section)).map(
          (entity) => {
            if (entity instanceof Section) {
              return dumpSectionBase(entity);
            }
          },
        )}
        {selectedEntities.map((entity) => {
          if (entity instanceof TextNode) {
            return dumpNode(entity);
          } else if (entity instanceof LineEdge) {
            return dumpEdge(entity);
          } else if (entity instanceof Section) {
            return dumpSection(entity);
          } else if (entity instanceof ImageNode) {
            return dumpImageNode(entity, svgConfig);
          }
        })}

        {/* 构建连线 */}
        {StageManager.getLineEdges()
          .filter(
            (edge) => selectedEntitiesUUIDSet.has(edge.source.uuid) && selectedEntitiesUUIDSet.has(edge.target.uuid),
          )
          .map((edge) => dumpEdge(edge))}
      </svg>
    );
  }

  function dumpStage(): React.ReactNode {
    // 如果没有任何节点，则抛出一个异常
    if (StageManager.isNoEntity()) {
      throw new Error("No nodes in stage.");
    }
    const padding = 30; // 留白
    const viewRectangle = getEntitiesOuterRectangle(StageManager.getEntities(), padding);
    // 计算画布的大小
    const width = viewRectangle.size.x;
    const height = viewRectangle.size.y;
    // 计算画布的 viewBox
    const viewBox = `${viewRectangle.location.x} ${viewRectangle.location.y} ${width} ${height}`;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox={viewBox}
        style={{
          backgroundColor: StageStyleManager.currentStyle.Background.toString(),
        }}
      >
        {SectionMethods.getSortedSectionsByZ(StageManager.getSections()).map((section) => dumpSectionBase(section))}
        {StageManager.getTextNodes().map((node) => dumpNode(node))}
        {StageManager.getLineEdges().map((edge) => dumpEdge(edge))}
        {StageManager.getSections().map((section) => dumpSection(section))}
        {StageManager.getImageNodes().map((imageNode) => dumpImageNode(imageNode, svgConfig))}
      </svg>
    );
  }

  /**
   * 将整个舞台导出为SVG字符串
   * @returns
   */
  export function dumpStageToSVGString(): string {
    return ReactDOMServer.renderToStaticMarkup(dumpStage());
  }

  /**
   * 将选中的节点导出为SVG字符串
   * @returns
   */
  export function dumpSelectedToSVGString(): string {
    return ReactDOMServer.renderToString(dumpSelected());
  }
}
