import { Color } from "../../../dataStruct/Color";
import { SymmetryCurve } from "../../../dataStruct/Curve";
import { Line } from "../../../dataStruct/Line";
import { Vector } from "../../../dataStruct/Vector";
import { Edge } from "../../../Edge";
import { Camera } from "../../../stage/Camera";
import { Renderer } from "../renderer";
import { RenderUtils } from "../RenderUtils";

export namespace EdgeRenderer {
  export function renderEdge(edge: Edge) {
    if (edge.source.uuid == edge.target.uuid) {
      renderCycleEdge(edge);
    } else {
      renderSymmetryCurveEdge(edge);
      // renderStraightEdge(edge);
    }

    // 如果有文字，绘制文字
    if (edge.text.trim() !== "") {
      const midPoint = edge.bodyLine.midPoint();
      RenderUtils.renderTextFromCenter(
        edge.text,
        Renderer.transformWorld2View(midPoint),
        Renderer.FONT_SIZE * Camera.currentScale,
      );
    }
    // 选中的高亮效果
    if (edge.isSelected) {
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.start),
        Renderer.transformWorld2View(edge.bodyLine.end),
        new Color(0, 255, 0, 0.5),
        4 * Camera.currentScale,
      );
    }
  }

  function renderSymmetryCurveEdge(edge: Edge) {
    // 绘制曲线本体
    const start = Renderer.transformWorld2View(edge.bodyLine.start);
    const end = Renderer.transformWorld2View(edge.bodyLine.end);
    const direction = end.subtract(start);
    const startDirection = new Vector(
      Math.abs(direction.x) >= Math.abs(direction.y) ? direction.x : 0,
      Math.abs(direction.x) >= Math.abs(direction.y) ? 0 : direction.y,
    ).normalize();
    const size = 15; // 箭头大小
    const curve = new SymmetryCurve(
      start,
      startDirection,
      end.subtract(startDirection.multiply((size / 2) * Camera.currentScale)),
      startDirection.multiply(-1),
      Math.abs(direction.magnitude()) / 2,
    );
    RenderUtils.renderSymmetryCurve(
      curve,
      new Color(204, 204, 204),
      2 * Camera.currentScale,
    );
    // 画箭头

    const endPoint = edge.bodyLine.end
      .clone()
      .subtract(startDirection.multiply(4.75));
    renderArrowHead(endPoint, startDirection, size);
  }

  function renderStraightEdge(edge: Edge) {
    // 直线绘制
    if (edge.text.trim() === "") {
      // 没有文字的边
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.start),
        Renderer.transformWorld2View(edge.bodyLine.end),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
    } else {
      // 有文字的边
      const midPoint = edge.bodyLine.midPoint();
      const startHalf = new Line(edge.bodyLine.start, midPoint);
      const endHalf = new Line(midPoint, edge.bodyLine.end);
      RenderUtils.renderTextFromCenter(
        edge.text,
        Renderer.transformWorld2View(midPoint),
        Renderer.FONT_SIZE * Camera.currentScale,
      );
      const edgeTextRectangle = edge.textRectangle;

      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.start),
        Renderer.transformWorld2View(
          edgeTextRectangle.getLineIntersectionPoint(startHalf),
        ),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.end),
        Renderer.transformWorld2View(
          edgeTextRectangle.getLineIntersectionPoint(endHalf),
        ),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
    }
    // 画箭头
    {
      const size = 15;
      const direction = edge.target.rectangle
        .getCenter()
        .subtract(edge.source.rectangle.getCenter())
        .normalize();
      const endPoint = edge.bodyLine.end.clone();
      renderArrowHead(endPoint, direction, size);
    }
  }

  /**
   * 绘制自环型的边
   * @param edge
   */
  function renderCycleEdge(edge: Edge) {
    // 自环
    RenderUtils.renderArc(
      Renderer.transformWorld2View(edge.target.rectangle.location),
      (edge.target.rectangle.size.y / 2) * Camera.currentScale,
      Math.PI / 2,
      0,
      new Color(204, 204, 204),
      2 * Camera.currentScale,
    );
    // 画箭头
    {
      const size = 15;
      const direction = new Vector(1, 0).rotateDegrees(15);
      const endPoint = edge.target.rectangle.leftCenter;
      renderArrowHead(endPoint, direction, size);
    }
  }

  /**
   * 绘制箭头
   * @param endPoint
   * @param direction
   * @param size
   */
  function renderArrowHead(endPoint: Vector, direction: Vector, size: number) {
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
