import React from "react";
import ReactDOMServer from "react-dom/server";
import { colorInvert } from "../dataStruct/Color";
import { Rectangle } from "../dataStruct/shape/Rectangle";
import { Vector } from "../dataStruct/Vector";
import { EdgeRenderer } from "../render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "../render/canvas2d/renderer";
import { SvgUtils } from "../render/svg/SvgUtils";
import { StageStyleManager } from "../service/stageStyle/StageStyleManager";
import { LineEdge } from "../stageObject/association/LineEdge";
import { Section } from "../stageObject/entity/Section";
import { TextNode } from "../stageObject/entity/TextNode";
import { Entity } from "../stageObject/StageObject";
import { StageManager } from "./stageManager/StageManager";

/**
 * 将舞台当前内容导出为SVG
 *
 *
 */
export namespace StageDumperSvg {
  export function dumpNode(node: TextNode) {
    if (node.isHiddenBySectionCollapse) {
      return <></>;
    }
    return (
      <>
        {SvgUtils.rectangle(
          node.rectangle,
          node.color,
          StageStyleManager.currentStyle.StageObjectBorderColor,
          2,
        )}
        {SvgUtils.textFromCenter(
          node.text,
          node.rectangle.center,
          Renderer.FONT_SIZE,
          node.color.a === 1
            ? colorInvert(node.color)
            : colorInvert(StageStyleManager.currentStyle.BackgroundColor),
        )}
      </>
    );
  }
  export function dumpSection(section: Section) {
    if (section.isHiddenBySectionCollapse) {
      return <></>;
    }
    return (
      <>
        {SvgUtils.rectangle(
          section.rectangle,
          section.color,
          StageStyleManager.currentStyle.StageObjectBorderColor,
          2,
        )}
        {SvgUtils.textFromLeftTop(
          section.text,
          section.rectangle.leftTop,
          Renderer.FONT_SIZE,
          StageStyleManager.currentStyle.StageObjectBorderColor,
        )}
      </>
    );
  }
  export function dumpEdge(edge: LineEdge): React.ReactNode {
    return EdgeRenderer.getEdgeSvg(edge);
  }

  function getEntitiesOuterRectangle(
    entities: Entity[],
    padding: number,
  ): Rectangle {
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
      if (
        entity.collisionBox.getRectangle().location.x +
          entity.collisionBox.getRectangle().size.x >
        maxX
      ) {
        maxX =
          entity.collisionBox.getRectangle().location.x +
          entity.collisionBox.getRectangle().size.x +
          padding;
      }
      if (
        entity.collisionBox.getRectangle().location.y +
          entity.collisionBox.getRectangle().size.y >
        maxY
      ) {
        maxY =
          entity.collisionBox.getRectangle().location.y +
          entity.collisionBox.getRectangle().size.y +
          padding;
      }
    }
    return new Rectangle(
      new Vector(minX, minY),
      new Vector(maxX - minX, maxY - minY),
    );
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

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox={viewBox}
        style={{
          backgroundColor:
            StageStyleManager.currentStyle.BackgroundColor.toString(),
        }}
      >
        {/* 选中的部分 */}
        {selectedEntities.map((entity) => {
          if (entity instanceof TextNode) {
            return dumpNode(entity);
          } else if (entity instanceof LineEdge) {
            return dumpEdge(entity);
          } else if (entity instanceof Section) {
            return dumpSection(entity);
          }
        })}
        {/* 构建连线 */}
        {StageManager.getLineEdges()
          .filter((edge) => edge.target.isSelected && edge.source.isSelected)
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
    const viewRectangle = getEntitiesOuterRectangle(
      StageManager.getEntities(),
      padding,
    );
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
          backgroundColor:
            StageStyleManager.currentStyle.BackgroundColor.toString(),
        }}
      >
        {StageManager.getTextNodes().map((node) => dumpNode(node))}
        {StageManager.getLineEdges().map((edge) => dumpEdge(edge))}
        {StageManager.getSections().map((section) => dumpSection(section))}
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
