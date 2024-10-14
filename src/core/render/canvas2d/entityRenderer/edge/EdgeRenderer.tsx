import { Color } from "../../../../dataStruct/Color";

import { Vector } from "../../../../dataStruct/Vector";
import { Edge } from "../../../../entity/Edge";
import { Node } from "../../../../entity/Node";
import { Settings } from "../../../../Settings";

import { Renderer } from "../../renderer";
import { RenderUtils } from "../../RenderUtils";
import { StraightEdgeRenderer } from "./concrete/StraightEdgeRenderer";
import { SymmetryCurveEdgeRenderer } from "./concrete/SymmetryCurveEdgeRenderer";

/**
 * 边的总渲染器单例
 */
export namespace EdgeRenderer {
  // let currentRenderer = new StraightEdgeRenderer();
  let currentRenderer = new SymmetryCurveEdgeRenderer();

  export function checkRendererBySettings(
    lineStyle: Settings.Settings["lineStyle"],
  ) {
    if (lineStyle === "stright") {
      currentRenderer = new StraightEdgeRenderer();
    } else if (lineStyle === "bezier") {
      currentRenderer = new SymmetryCurveEdgeRenderer();
    }
  }

  /**
   * 更新渲染器
   */
  export async function updateRenderer(style: Settings.Settings["lineStyle"]) {
    if (
      style === "stright" &&
      !(currentRenderer instanceof StraightEdgeRenderer)
    ) {
      currentRenderer = new StraightEdgeRenderer();
    } else if (
      style === "bezier" &&
      !(currentRenderer instanceof SymmetryCurveEdgeRenderer)
    ) {
      currentRenderer = new SymmetryCurveEdgeRenderer();
    }
  }
  Settings.watch("lineStyle", updateRenderer);

  export function renderEdge(edge: Edge) {
    if (edge.source.uuid == edge.target.uuid) {
      currentRenderer.renderCycleState(edge);
    } else {
      currentRenderer.renderNormalState(edge);
      // 将来还可能会有双向线的偏移状态
    }

    // 选中的高亮效果
    if (edge.isSelected) {
      currentRenderer.renderSelectedShadow(edge);
    }
  }

  export function renderVirtualEdge(startNode: Node, mouseLocation: Vector) {
    currentRenderer.renderVirtualEdge(startNode, mouseLocation);
  }
  export function renderVirtualConfirmedEdge(startNode: Node, endNode: Node) {
    currentRenderer.renderVirtualConfirmedEdge(startNode, endNode);
  }
  export function renderHoverShadow(edge: Edge) {
    currentRenderer.renderHoverShadow(edge);
  }

  export function renderWarningShadow(edge: Edge) {
    currentRenderer.renderWarningShadow(edge);
  }

  export function getCuttingEffects(edge: Edge) {
    return currentRenderer.getCuttingEffects(edge);
  }
  export function getConnectedEffects(startNode: Node, toNode: Node) {
    return currentRenderer.getConnectedEffects(startNode, toNode);
  }

  /**
   * 绘制箭头
   * @param endPoint
   * @param direction
   * @param size
   */
  export function renderArrowHead(
    endPoint: Vector,
    direction: Vector,
    size: number,
  ) {
    const reDirection = direction.clone().multiply(-1);
    const location2 = endPoint.add(
      reDirection.multiply(size).rotateDegrees(15),
    );
    const location3 = endPoint.add(reDirection.multiply(size * 0.5));
    const location4 = endPoint.add(
      reDirection.multiply(size).rotateDegrees(-15),
    );
    RenderUtils.renderPolygonAndFill(
      [
        Renderer.transformWorld2View(endPoint),
        Renderer.transformWorld2View(location2),
        Renderer.transformWorld2View(location3),
        Renderer.transformWorld2View(location4),
      ],
      new Color(204, 204, 204),
      new Color(204, 204, 204),
      0,
    );
  }
}
