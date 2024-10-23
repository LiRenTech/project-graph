import { Color } from "../../../../dataStruct/Color";

import { Vector } from "../../../../dataStruct/Vector";
import { Edge } from "../../../../stageObject/association/Edge";
import { Settings } from "../../../../Settings";

import { Renderer } from "../../renderer";
import { RenderUtils } from "../../RenderUtils";
import { StraightEdgeRenderer } from "./concrete/StraightEdgeRenderer";
import { SymmetryCurveEdgeRenderer } from "./concrete/SymmetryCurveEdgeRenderer";
import { VerticalPolyEdgeRenderer } from "./concrete/VerticalPolyEdgeRenderer";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { ConnectableEntity } from "../../../../stageObject/StageObject";
import { EdgeRendererClass } from "./EdgeRendererClass";

/**
 * 边的总渲染器单例
 */
export namespace EdgeRenderer {
  // let currentRenderer = new StraightEdgeRenderer();
  let currentRenderer: EdgeRendererClass = new SymmetryCurveEdgeRenderer();

  /**
   * 初始化边的渲染器
   */
  export function init() {
    Settings.watch("lineStyle", updateRenderer);
  }

  export function checkRendererBySettings(
    lineStyle: Settings.Settings["lineStyle"],
  ) {
    if (lineStyle === "straight") {
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
      style === "straight" &&
      !(currentRenderer instanceof StraightEdgeRenderer)
    ) {
      currentRenderer = new StraightEdgeRenderer();
    } else if (
      style === "bezier" &&
      !(currentRenderer instanceof SymmetryCurveEdgeRenderer)
    ) {
      currentRenderer = new SymmetryCurveEdgeRenderer();
    } else if (
      style === "vertical" &&
      !(currentRenderer instanceof VerticalPolyEdgeRenderer)
    ) {
      currentRenderer = new VerticalPolyEdgeRenderer();
    }
  }

  export function renderEdge(edge: Edge) {
    if (edge.source.uuid == edge.target.uuid) {
      currentRenderer.renderCycleState(edge);
    } else {
      currentRenderer.renderNormalState(edge);
      // 将来还可能会有双向线的偏移状态
    }

    // 选中的高亮效果
    if (edge.isSelected) {
      CollisionBoxRenderer.render(edge.collisionBox, new Color(255, 255, 0, 0.5))
    }
  }

  export function renderVirtualEdge(
    startNode: ConnectableEntity,
    mouseLocation: Vector,
  ) {
    currentRenderer.renderVirtualEdge(startNode, mouseLocation);
  }
  export function renderVirtualConfirmedEdge(
    startNode: ConnectableEntity,
    endNode: ConnectableEntity,
  ) {
    currentRenderer.renderVirtualConfirmedEdge(startNode, endNode);
  }

  export function getCuttingEffects(edge: Edge) {
    return currentRenderer.getCuttingEffects(edge);
  }
  export function getConnectedEffects(startNode: ConnectableEntity, toNode: ConnectableEntity) {
    return currentRenderer.getConnectedEffects(startNode, toNode);
  }

  /**
   * 绘制箭头
   * @param endPoint 世界坐标
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
