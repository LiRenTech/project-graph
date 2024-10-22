import { Color } from "../../../../../dataStruct/Color";
import { Line } from "../../../../../dataStruct/shape/Line";
import { ProgressNumber } from "../../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../../dataStruct/Vector";
import { Edge } from "../../../../../stageObject/association/Edge";
import { CircleFlameEffect } from "../../../../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../../../../effect/concrete/LineCuttingEffect";
import { Effect } from "../../../../../effect/effect";
import { TextNode } from "../../../../../stageObject/entity/TextNode";
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

  getConnectedEffects(startNode: TextNode, toNode: TextNode): Effect[] {
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
   *    上
   * 左 end 右
   *    下
   * 如果起点在左侧，返回 "->" 即 new Vector(1, 0)
   * @param edge
   * @returns
   */
  getVerticalDirection(edge: Edge): Vector {
    const startLocation = edge.source.rectangle.center;
    const endLocation = edge.target.rectangle.center;
    const startToEnd = endLocation.subtract(startLocation);
    if (startLocation.x < endLocation.x) {
      // |左侧
      if (startLocation.y < endLocation.y) {
        // |左上
        if (Math.abs(startToEnd.y) > Math.abs(startToEnd.x)) {
          // ↓
          return new Vector(0, 1);
        } else {
          // →
          return new Vector(1, 0);
        }
      } else {
        // |左下
        if (Math.abs(startToEnd.y) > Math.abs(startToEnd.x)) {
          // ↑
          return new Vector(0, -1);
        } else {
          // →
          return new Vector(1, 0);
        }
      }
    } else {
      // |右侧
      if (startLocation.y < endLocation.y) {
        // |右上
        if (Math.abs(startToEnd.y) > Math.abs(startToEnd.x)) {
          // ↓
          return new Vector(0, 1);
        } else {
          // ←
          return new Vector(-1, 0);
        }
      } else {
        // |右下
        if (Math.abs(startToEnd.y) > Math.abs(startToEnd.x)) {
          // ↑
          return new Vector(0, -1);
        } else {
          // ←
          return new Vector(-1, 0);
        }
      }
    }
  }

  /**
   * 固定长度
   */
  fixedLength: number = 100;

  // debug 测试
  renderTest(edge: Edge) {
    for (let i = 0; i < 4; i++) {
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(edge.target.rectangle.center),
        Renderer.transformWorld2View(
          edge.target.rectangle.center.add(
            new Vector(100, 0).rotateDegrees(45 + 90 * i),
          ),
        ),
        Color.Green,
        1,
      );
    }
  }
  gaussianFunction(x: number) {
    // e ^(-x^2)
    return Math.exp(-(x * x) / 10000);
  }

  public renderNormalState(edge: Edge): void {
    // this.renderTest(edge);
    // 直线绘制
    if (edge.text.trim() === "") {
      const verticalDirection = this.getVerticalDirection(edge);
      if (verticalDirection.x === 0) {
        // 左右偏离程度

        const rate =
          1 -
          this.gaussianFunction(
            edge.target.rectangle.center.x - edge.source.rectangle.center.x,
          );
        // 左右偏离距离 恒正
        const distance = (rate * edge.target.rectangle.size.x) / 2;
        // 根据偏移距离计算附加高度  恒正
        const h = (edge.target.rectangle.size.x / 2) * (1 - rate);
        // 终点
        const p1 = new Vector(
          edge.target.rectangle.center.x +
            distance *
              (edge.source.rectangle.center.x > edge.target.rectangle.center.x
                ? 1
                : -1),
          verticalDirection.y > 0
            ? edge.target.rectangle.top
            : edge.target.rectangle.bottom,
        );
        const length =
          (this.fixedLength + h) * (verticalDirection.y > 0 ? -1 : 1);
        const p2 = p1.add(new Vector(0, length));

        const p4 = new Vector(
          edge.source.rectangle.center.x,
          verticalDirection.y > 0
            ? edge.source.rectangle.bottom
            : edge.source.rectangle.top,
        );

        const p3 = new Vector(p4.x, p2.y);
        RenderUtils.renderSolidLineMultiple(
          [
            Renderer.transformWorld2View(p1),
            Renderer.transformWorld2View(p2),
            Renderer.transformWorld2View(p3),
            Renderer.transformWorld2View(p4),
          ],
          new Color(204, 204, 204),
          2 * Camera.currentScale,
        );
        EdgeRenderer.renderArrowHead(p1, verticalDirection, 15);
      } else if (verticalDirection.y === 0) {
        // 左右
        const rate =
          1 -
          this.gaussianFunction(
            edge.target.rectangle.center.y - edge.source.rectangle.center.y,
          );
        // 偏离距离 恒正
        const distance = (rate * edge.target.rectangle.size.y) / 2;
        // 根据偏移距离计算附加高度
        const h = (edge.target.rectangle.size.y / 2) * (1 - rate);
        // 终点
        const p1 = new Vector(
          verticalDirection.x > 0
            ? edge.target.rectangle.left
            : edge.target.rectangle.right,
          edge.target.rectangle.center.y +
            distance *
              (edge.source.rectangle.center.y > edge.target.rectangle.center.y
                ? 1
                : -1),
        );
        // length 是固定长度+h
        const length =
          (this.fixedLength + h) * (verticalDirection.x > 0 ? -1 : 1);
        const p2 = p1.add(new Vector(length, 0));

        const p4 = new Vector(
          verticalDirection.x > 0
            ? edge.source.rectangle.right
            : edge.source.rectangle.left,
          edge.source.rectangle.center.y,
        );

        const p3 = new Vector(p2.x, p4.y);

        RenderUtils.renderSolidLineMultiple(
          [
            Renderer.transformWorld2View(p1),
            Renderer.transformWorld2View(p2),
            Renderer.transformWorld2View(p3),
            Renderer.transformWorld2View(p4),
          ],
          new Color(204, 204, 204),
          2 * Camera.currentScale,
        );
        EdgeRenderer.renderArrowHead(p1, verticalDirection, 15);
      } else {
        // 不会出现的情况
      }

      // 没有文字的边
      // RenderUtils.renderSolidLine(
      //   Renderer.transformWorld2View(edge.bodyLine.start),
      //   Renderer.transformWorld2View(edge.bodyLine.end),
      //   new Color(204, 204, 204),
      //   2 * Camera.currentScale,
      // );
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

  public renderVirtualEdge(startNode: TextNode, mouseLocation: Vector): void {
    RenderUtils.renderGradientLine(
      Renderer.transformWorld2View(startNode.rectangle.getCenter()),
      Renderer.transformWorld2View(mouseLocation),
      new Color(255, 255, 255, 0),
      new Color(255, 255, 255, 0.5),
      2,
    );
  }

  public renderVirtualConfirmedEdge(startNode: TextNode, endNode: TextNode): void {
    RenderUtils.renderGradientLine(
      Renderer.transformWorld2View(startNode.rectangle.getCenter()),
      Renderer.transformWorld2View(endNode.rectangle.getCenter()),
      new Color(0, 255, 0, 0),
      new Color(0, 255, 0, 0.5),
      2,
    );
  }
}
