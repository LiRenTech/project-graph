import React from "react";
import { TextNode } from "../stageObject/entity/TextNode";
import { Renderer } from "../render/canvas2d/renderer";
import { StageManager } from "./stageManager/StageManager";
import ReactDOMServer from "react-dom/server";
import { Edge } from "../stageObject/association/Edge";
import { StageStyleManager } from "../stageStyle/StageStyleManager";

/**
 * 将舞台当前内容导出为SVG
 *
 *
 */
export namespace StageDumperSvg {
  export function dumpNode(node: TextNode) {
    return (
      <>
        <rect
          key={node.uuid}
          x={node.rectangle.location.x}
          y={node.rectangle.location.y}
          width={node.rectangle.size.x}
          height={node.rectangle.size.y}
          rx={Renderer.NODE_ROUNDED_RADIUS}
          ry={Renderer.NODE_ROUNDED_RADIUS}
          fill={node.color.toString()}
          stroke={StageStyleManager.currentStyle.StageObjectBorderColor.toString()}
          strokeWidth={2}
        />
        <text
          x={node.rectangle.center.x}
          y={node.rectangle.center.y + Renderer.NODE_PADDING}
          key={node.uuid + "-text"}
          fill={StageStyleManager.currentStyle.StageObjectBorderColor.toString()}
          fontSize={Renderer.FONT_SIZE}
          textAnchor="middle"
          fontFamily="MiSans"
        >
          {node.text}
        </text>
      </>
    );
  }
  export function dumpEdge(edge: Edge): React.ReactNode {
    return (
      <line
        key={edge.source.uuid + "-" + edge.target.uuid}
        x1={edge.bodyLine.start.x}
        y1={edge.bodyLine.start.y}
        x2={edge.bodyLine.end.x}
        y2={edge.bodyLine.end.y}
        stroke={StageStyleManager.currentStyle.StageObjectBorderColor.toString()}
        strokeWidth={2}
      />
    );
  }

  export function dumpStage(): React.ReactNode {
    // 如果没有任何节点，则抛出一个异常
    if (StageManager.isNoEntity()) {
      throw new Error("No nodes in stage.");
    }
    // 寻找最左侧的边缘，最上的边缘，最下和最右侧
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const padding = 30; // 留白
    for (const node of StageManager.getTextNodes()) {
      if (node.rectangle.location.x < minX) {
        minX = node.rectangle.location.x - padding;
      }
      if (node.rectangle.location.y < minY) {
        minY = node.rectangle.location.y - padding;
      }
      if (node.rectangle.location.x + node.rectangle.size.x > maxX) {
        maxX = node.rectangle.location.x + node.rectangle.size.x + padding;
      }
      if (node.rectangle.location.y + node.rectangle.size.y > maxY) {
        maxY = node.rectangle.location.y + node.rectangle.size.y + padding;
      }
    }
    // 计算画布的大小
    const width = maxX - minX;
    const height = maxY - minY;
    // 计算画布的 viewBox
    const viewBox = `${minX} ${minY} ${width} ${height}`;

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
        {StageManager.getEdges().map((edge) => dumpEdge(edge))}
      </svg>
    );
  }

  export function dumpStageToSVGString(): string {
    // return ReactDOMServer.renderToString(dumpStage());
    return ReactDOMServer.renderToStaticMarkup(dumpStage());
  }
}
