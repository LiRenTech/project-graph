import { Controller } from "../../../../../controller/Controller";
import { Color } from "../../../../../dataStruct/Color";
import { Line } from "../../../../../dataStruct/Line";
import { ProgressNumber } from "../../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../../dataStruct/Vector";
import { Edge } from "../../../../../entity/Edge";
import { CircleFlameEffect } from "../../../../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../../../../effect/concrete/LineCuttingEffect";
import { Effect } from "../../../../../effect/effect";
import { Node } from "../../../../../entity/Node";
import { Camera } from "../../../../../stage/Camera";
import { Renderer } from "../../../renderer";
import { RenderUtils } from "../../../RenderUtils";
import { EdgeRenderer } from "../EdgeRenderer";
import { EdgeRendererClass } from "../EdgeRendererClass";

/**
 * 折线渲染器
 */
export class VerticalPolyEdgeRenderer extends EdgeRendererClass {
  getCuttingEffects(edge: Edge): Effect[] {
    const midLocation = edge.bodyLine.midPoint();
    return [
      new LineCuttingEffect(
        new ProgressNumber(0, 15),
        midLocation,
        edge.bodyLine.start,
        new Color(255, 0, 0, 0),
        new Color(255, 0, 0, 1),
        20,
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, 15),
        midLocation,
        edge.bodyLine.end,
        new Color(255, 0, 0, 0),
        new Color(255, 0, 0, 1),
        20,
      ),
      new CircleFlameEffect(
        new ProgressNumber(0, 15),
        edge.bodyLine.midPoint(),
        50,
        new Color(255, 0, 0, 1),
      ),
    ];
  }

  getConnectedEffects(startNode: Node, toNode: Node): Effect[] {
    return [
      new CircleFlameEffect(
        new ProgressNumber(0, 15),
        startNode.rectangle.center,
        80,
        new Color(83, 175, 29, 1),
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, 30),
        startNode.rectangle.center,
        toNode.rectangle.center,
        new Color(78, 201, 176, 1),
        new Color(83, 175, 29, 1),
        20,
      ),
    ];
  }

  /**
   * 起始点在目标点的哪个区域，返回起始点朝向终点的垂直向量
   * @param edge
   * @returns
   */
  getVerticalDirection(edge: Edge): Vector {
    // 先将终点看成中心，将起始点顺时针旋转45度。
    const endToStart = edge.target.rectangle.center
      .subtract(edge.source.rectangle.center)
      .rotateDegrees(45);
    const degrees = endToStart.toDegrees();
    if (degrees >= 0 && degrees < 90) {
      // 上方
      return new Vector(0, 1);
    } else if (degrees >= 90 && degrees < 180) {
      // 左侧
      return new Vector(1, 0);
    } else if (degrees >= 180 && degrees < 270) {
      // 下方
      return new Vector(0, -1);
    } else {
      // 右侧
      return new Vector(-1, 0);
    }
  }

  /**
   * 固定长度
   */
  fixedLength: number = 20;

  public renderNormalState(edge: Edge): void {
    // 直线绘制
    if (edge.text.trim() === "") {
      const verticalDirection = this.getVerticalDirection(edge);
      if (verticalDirection.x === 0) {
        // 上下
        const gaussian = new Gaussian(0, 1);
        // 左右偏离程度
        const rate =
          1 - gaussian.calculate(edge.bodyLine.start.x - edge.bodyLine.end.x);
        // 左右偏离距离
        const distance = (rate * edge.target.rectangle.size.x) / 2;
        // 根据偏移距离计算附加高度
        const h = (edge.target.rectangle.size.x / 2) * rate;
        // 终点
        const p1 = new Vector(
          edge.target.rectangle.center.x + distance,
          verticalDirection.y > 0
            ? edge.target.rectangle.location.y
            : edge.target.rectangle.bottom,
        );
        const length = this.fixedLength + h * verticalDirection.y > 0? 1 : -1
        const p2 = p1.add(new Vector(0, length))
        
        RenderUtils.renderSolidLine(
          Renderer.transformWorld2View(p1),
          Renderer.transformWorld2View(p2),
          new Color(204, 204, 204),
          2 * Camera.currentScale,
        );
      } else if (verticalDirection.y === 0) {
        // 左右
      }

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
      EdgeRenderer.renderArrowHead(endPoint, direction, size);
    }
  }

  public renderCycleState(edge: Edge): void {
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
      EdgeRenderer.renderArrowHead(endPoint, direction, size);
    }
  }

  public renderVirtualEdge(startNode: Node, mouseLocation: Vector): void {
    RenderUtils.renderGradientLine(
      Renderer.transformWorld2View(startNode.rectangle.getCenter()),
      Renderer.transformWorld2View(mouseLocation),
      new Color(255, 255, 255, 0),
      new Color(255, 255, 255, 0.5),
      2,
    );
  }

  public renderVirtualConfirmedEdge(startNode: Node, endNode: Node): void {
    RenderUtils.renderGradientLine(
      Renderer.transformWorld2View(startNode.rectangle.getCenter()),
      Renderer.transformWorld2View(endNode.rectangle.getCenter()),
      new Color(0, 255, 0, 0),
      new Color(0, 255, 0, 0.5),
      2,
    );
  }

  public renderHoverShadow(edge: Edge): void {
    RenderUtils.renderSolidLine(
      Renderer.transformWorld2View(edge.bodyLine.start),
      Renderer.transformWorld2View(edge.bodyLine.end),
      new Color(0, 255, 0, 0.1),
      Controller.edgeHoverTolerance * 2 * Camera.currentScale,
    );
  }

  public renderSelectedShadow(edge: Edge): void {
    RenderUtils.renderSolidLine(
      Renderer.transformWorld2View(edge.bodyLine.start),
      Renderer.transformWorld2View(edge.bodyLine.end),
      new Color(0, 255, 0, 0.5),
      4 * Camera.currentScale,
    );
  }

  public renderWarningShadow(edge: Edge): void {
    RenderUtils.renderSolidLine(
      Renderer.transformWorld2View(edge.source.rectangle.getCenter()),
      Renderer.transformWorld2View(edge.target.rectangle.getCenter()),
      new Color(255, 0, 0, 0.5),
      2 * Camera.currentScale,
    );
  }
}
