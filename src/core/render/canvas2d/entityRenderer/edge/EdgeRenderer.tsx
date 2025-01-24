import { Color } from "../../../../dataStruct/Color";

import { Vector } from "../../../../dataStruct/Vector";
import { Settings } from "../../../../service/Settings";
import { Camera } from "../../../../stage/Camera";
import { StageManager } from "../../../../stage/stageManager/StageManager";
import { CublicCatmullRomSplineEdge } from "../../../../stage/stageObject/association/CublicCatmullRomSplineEdge";
import { LineEdge } from "../../../../stage/stageObject/association/LineEdge";
import { Section } from "../../../../stage/stageObject/entity/Section";

import { StageStyleManager } from "../../../../service/stageStyle/StageStyleManager";
import { ConnectableEntity } from "../../../../stage/stageObject/StageObject";
import { ShapeRenderer } from "../../basicRenderer/shapeRenderer";
import { Renderer } from "../../renderer";
import { WorldRenderUtils } from "../../utilsRenderer/WorldRenderUtils";
import { CollisionBoxRenderer } from "../CollisionBoxRenderer";
import { StraightEdgeRenderer } from "./concrete/StraightEdgeRenderer";
import { SymmetryCurveEdgeRenderer } from "./concrete/SymmetryCurveEdgeRenderer";
import { VerticalPolyEdgeRenderer } from "./concrete/VerticalPolyEdgeRenderer";
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
  async function updateRenderer(style: Settings.Settings["lineStyle"]) {
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

  export function renderEdge(edge: LineEdge) {
    if (
      edge.source.isHiddenBySectionCollapse &&
      edge.target.isHiddenBySectionCollapse
    ) {
      return;
    }

    edge = EdgeRenderer.getEdgeView(edge);

    const source = edge.source;
    const target = edge.target;

    if (source.uuid == target.uuid) {
      currentRenderer.renderCycleState(edge);
    } else {
      if (edge.isShifting) {
        currentRenderer.renderShiftingState(edge);
      } else {
        currentRenderer.renderNormalState(edge);
      }
    }

    // 选中的高亮效果
    if (edge.isSelected) {
      CollisionBoxRenderer.render(
        edge.collisionBox,
        new Color(255, 255, 0, 0.5),
      );
    }
  }

  export function renderCrEdge(edge: CublicCatmullRomSplineEdge) {
    if (
      edge.source.isHiddenBySectionCollapse &&
      edge.target.isHiddenBySectionCollapse
    ) {
      return;
    }
    const crShape = edge.getShape();
    // 画曲线
    WorldRenderUtils.renderCublicCatmullRomSpline(
      crShape,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2,
    );
    // 画控制点们
    for (const point of crShape.controlPoints) {
      ShapeRenderer.renderCircle(
        Renderer.transformWorld2View(point),
        5 * Camera.currentScale,
        Color.Transparent,
        StageStyleManager.currentStyle.StageObjectBorderColor,
        2 * Camera.currentScale,
      );
    }
  }

  /**
   * 当一个内部可连接实体被外部连接但它的父级section折叠了
   * 通过这个函数能获取它的最小非折叠父级
   * 可以用于连线的某一端被折叠隐藏了的情况
   * @param innerEntity
   */
  export function getMinNonCollapseParentSection(
    innerEntity: ConnectableEntity,
  ): Section {
    const father = StageManager.SectionOptions.getFatherSections(innerEntity);
    if (father.length === 0) {
      // 直接抛出错误
      throw new Error("Can't find parent section");
    }
    const minSection = father[0];
    if (minSection.isHiddenBySectionCollapse) {
      return getMinNonCollapseParentSection(minSection);
    } else {
      return minSection;
    }
  }

  export function getEdgeView(edge: LineEdge): LineEdge {
    if (
      edge.source.isHiddenBySectionCollapse &&
      edge.target.isHiddenBySectionCollapse
    ) {
      return edge;
    } else if (
      !edge.source.isHiddenBySectionCollapse &&
      !edge.target.isHiddenBySectionCollapse
    ) {
      return edge;
    }

    if (edge.source.isHiddenBySectionCollapse) {
      return new LineEdge({
        source: getMinNonCollapseParentSection(edge.source).uuid,
        target: edge.target.uuid,
        text: edge.text,
        uuid: edge.uuid,
        type: "core:line_edge",
      });
    }
    if (edge.target.isHiddenBySectionCollapse) {
      return new LineEdge({
        source: edge.source.uuid,
        target: getMinNonCollapseParentSection(edge.target).uuid,
        text: edge.text,
        uuid: edge.uuid,
        type: "core:line_edge",
      });
    }
    return edge;
  }

  export function getEdgeSvg(edge: LineEdge): React.ReactNode {
    if (
      edge.source.isHiddenBySectionCollapse &&
      edge.target.isHiddenBySectionCollapse
    ) {
      return <></>;
    }

    if (edge.source.uuid == edge.target.uuid) {
      return currentRenderer.getCycleStageSvg(edge);
    } else {
      if (edge.isShifting) {
        return currentRenderer.getShiftingStageSvg(edge);
      } else {
        return currentRenderer.getNormalStageSvg(edge);
      }
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

  export function getCuttingEffects(edge: LineEdge) {
    return currentRenderer.getCuttingEffects(edge);
  }
  export function getConnectedEffects(
    startNode: ConnectableEntity,
    toNode: ConnectableEntity,
  ) {
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
    ShapeRenderer.renderPolygonAndFill(
      [
        Renderer.transformWorld2View(endPoint),
        Renderer.transformWorld2View(location2),
        Renderer.transformWorld2View(location3),
        Renderer.transformWorld2View(location4),
      ],
      StageStyleManager.currentStyle.StageObjectBorderColor,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      0,
    );
  }

  /**
   * 生成箭头的SVG多边形
   * @param endPoint 世界坐标
   * @param direction
   * @param size
   * @returns SVG多边形字符串
   */
  export function generateArrowHeadSvg(
    endPoint: Vector,
    direction: Vector,
    size: number,
  ): React.ReactNode {
    const reDirection = direction.clone().multiply(-1);
    const location2 = endPoint.add(
      reDirection.multiply(size).rotateDegrees(15),
    );
    const location3 = endPoint.add(reDirection.multiply(size * 0.5));
    const location4 = endPoint.add(
      reDirection.multiply(size).rotateDegrees(-15),
    );

    // 将计算得到的点转换为 SVG 坐标
    const pointsString = [endPoint, location2, location3, location4]
      .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
      .join(" ");

    // 返回SVG多边形字符串
    return (
      <polygon
        points={pointsString}
        fill={StageStyleManager.currentStyle.StageObjectBorderColor.toString()}
        stroke={StageStyleManager.currentStyle.StageObjectBorderColor.toString()}
      />
    );
  }
}
