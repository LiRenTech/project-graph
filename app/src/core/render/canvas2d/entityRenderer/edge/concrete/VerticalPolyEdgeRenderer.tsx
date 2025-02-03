import { Color } from "../../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../../dataStruct/ProgressNumber";
import { Line } from "../../../../../dataStruct/shape/Line";
import { Vector } from "../../../../../dataStruct/Vector";
import { CircleFlameEffect } from "../../../../../service/feedbackService/effectEngine/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../../../../service/feedbackService/effectEngine/concrete/LineCuttingEffect";
import { EffectObject } from "../../../../../service/feedbackService/effectEngine/effectObject";
import { StageStyleManager } from "../../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../../stage/Camera";
import { ConnectableEntity } from "../../../../../stage/stageObject/abstract/ConnectableEntity";
import { LineEdge } from "../../../../../stage/stageObject/association/LineEdge";
import { ConnectPoint } from "../../../../../stage/stageObject/entity/ConnectPoint";
import { CurveRenderer } from "../../../basicRenderer/curveRenderer";
import { ShapeRenderer } from "../../../basicRenderer/shapeRenderer";
import { TextRenderer } from "../../../basicRenderer/textRenderer";
import { Renderer } from "../../../renderer";
import { EdgeRenderer } from "../EdgeRenderer";
import { EdgeRendererClass } from "../EdgeRendererClass";

/**
 * 折线渲染器
 */
export class VerticalPolyEdgeRenderer extends EdgeRendererClass {
  getCuttingEffects(edge: LineEdge): EffectObject[] {
    const midLocation = edge.bodyLine.midPoint();
    return [
      new LineCuttingEffect(
        new ProgressNumber(0, 15),
        midLocation,
        edge.bodyLine.start,
        new Color(255, 0, 0, 1),
        new Color(255, 0, 0, 1),
        20,
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, 15),
        midLocation,
        edge.bodyLine.end,
        new Color(255, 0, 0, 1),
        new Color(255, 0, 0, 1),
        20,
      ),
      new CircleFlameEffect(new ProgressNumber(0, 15), edge.bodyLine.midPoint(), 50, new Color(255, 0, 0, 1)),
    ];
  }

  getConnectedEffects(startNode: ConnectableEntity, toNode: ConnectableEntity): EffectObject[] {
    return [
      new CircleFlameEffect(
        new ProgressNumber(0, 15),
        startNode.collisionBox.getRectangle().center,
        80,
        new Color(83, 175, 29, 1),
      ),
      new LineCuttingEffect(
        new ProgressNumber(0, 30),
        startNode.collisionBox.getRectangle().center,
        toNode.collisionBox.getRectangle().center,
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
  getVerticalDirection(edge: LineEdge): Vector {
    const startLocation = edge.source.collisionBox.getRectangle().center;
    const endLocation = edge.target.collisionBox.getRectangle().center;
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
  renderTest(edge: LineEdge) {
    for (let i = 0; i < 4; i++) {
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(edge.target.collisionBox.getRectangle().center),
        Renderer.transformWorld2View(
          edge.target.collisionBox.getRectangle().center.add(new Vector(100, 0).rotateDegrees(45 + 90 * i)),
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

  public renderNormalState(edge: LineEdge): void {
    // this.renderTest(edge);
    // 直线绘制
    if (edge.text.trim() === "") {
      const verticalDirection = this.getVerticalDirection(edge);
      if (verticalDirection.x === 0) {
        // 左右偏离程度

        const rate =
          1 -
          this.gaussianFunction(
            edge.target.collisionBox.getRectangle().center.x - edge.source.collisionBox.getRectangle().center.x,
          );
        // 左右偏离距离 恒正
        const distance = (rate * edge.target.collisionBox.getRectangle().size.x) / 2;
        // 根据偏移距离计算附加高度  恒正
        const h = (edge.target.collisionBox.getRectangle().size.x / 2) * (1 - rate);
        // 终点
        const p1 = new Vector(
          edge.target.collisionBox.getRectangle().center.x +
            distance *
              (edge.source.collisionBox.getRectangle().center.x > edge.target.collisionBox.getRectangle().center.x
                ? 1
                : -1),
          verticalDirection.y > 0
            ? edge.target.collisionBox.getRectangle().top
            : edge.target.collisionBox.getRectangle().bottom,
        );
        const length = (this.fixedLength + h) * (verticalDirection.y > 0 ? -1 : 1);
        const p2 = p1.add(new Vector(0, length));

        const p4 = new Vector(
          edge.source.collisionBox.getRectangle().center.x,
          verticalDirection.y > 0
            ? edge.source.collisionBox.getRectangle().bottom
            : edge.source.collisionBox.getRectangle().top,
        );

        const p3 = new Vector(p4.x, p2.y);
        CurveRenderer.renderSolidLineMultiple(
          [
            Renderer.transformWorld2View(p1),
            Renderer.transformWorld2View(p2),
            Renderer.transformWorld2View(p3),
            Renderer.transformWorld2View(p4),
          ],
          new Color(204, 204, 204),
          2 * Camera.currentScale,
        );

        if (!(edge.target instanceof ConnectPoint)) {
          EdgeRenderer.renderArrowHead(p1, verticalDirection, 15, edge.color);
        }
      } else if (verticalDirection.y === 0) {
        // 左右
        const rate =
          1 -
          this.gaussianFunction(
            edge.target.collisionBox.getRectangle().center.y - edge.source.collisionBox.getRectangle().center.y,
          );
        // 偏离距离 恒正
        const distance = (rate * edge.target.collisionBox.getRectangle().size.y) / 2;
        // 根据偏移距离计算附加高度
        const h = (edge.target.collisionBox.getRectangle().size.y / 2) * (1 - rate);
        // 终点
        const p1 = new Vector(
          verticalDirection.x > 0
            ? edge.target.collisionBox.getRectangle().left
            : edge.target.collisionBox.getRectangle().right,
          edge.target.collisionBox.getRectangle().center.y +
            distance *
              (edge.source.collisionBox.getRectangle().center.y > edge.target.collisionBox.getRectangle().center.y
                ? 1
                : -1),
        );
        // length 是固定长度+h
        const length = (this.fixedLength + h) * (verticalDirection.x > 0 ? -1 : 1);
        const p2 = p1.add(new Vector(length, 0));

        const p4 = new Vector(
          verticalDirection.x > 0
            ? edge.source.collisionBox.getRectangle().right
            : edge.source.collisionBox.getRectangle().left,
          edge.source.collisionBox.getRectangle().center.y,
        );

        const p3 = new Vector(p2.x, p4.y);

        CurveRenderer.renderSolidLineMultiple(
          [
            Renderer.transformWorld2View(p1),
            Renderer.transformWorld2View(p2),
            Renderer.transformWorld2View(p3),
            Renderer.transformWorld2View(p4),
          ],
          new Color(204, 204, 204),
          2 * Camera.currentScale,
        );

        if (!(edge.target instanceof ConnectPoint)) {
          EdgeRenderer.renderArrowHead(p1, verticalDirection, 15, edge.color);
        }
      } else {
        // 不会出现的情况
      }

      // 没有文字的边
      // CurveRenderer.renderSolidLine(
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
      TextRenderer.renderTextFromCenter(
        edge.text,
        Renderer.transformWorld2View(midPoint),
        Renderer.FONT_SIZE * Camera.currentScale,
      );
      const edgeTextRectangle = edge.textRectangle;

      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.start),
        Renderer.transformWorld2View(edgeTextRectangle.getLineIntersectionPoint(startHalf)),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.end),
        Renderer.transformWorld2View(edgeTextRectangle.getLineIntersectionPoint(endHalf)),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
      // 画箭头
      if (!(edge.target instanceof ConnectPoint)) {
        const size = 15;
        const direction = edge.target.collisionBox
          .getRectangle()
          .getCenter()
          .subtract(edge.source.collisionBox.getRectangle().getCenter())
          .normalize();
        const endPoint = edge.bodyLine.end.clone();
        EdgeRenderer.renderArrowHead(endPoint, direction, size, edge.color);
      }
    }
  }
  public renderShiftingState(edge: LineEdge): void {
    const shiftingMidPoint = edge.shiftingMidPoint;
    // 从source.Center到shiftingMidPoint的线
    const startLine = new Line(edge.source.collisionBox.getRectangle().center, shiftingMidPoint);
    const endLine = new Line(shiftingMidPoint, edge.target.collisionBox.getRectangle().center);
    const startPoint = edge.source.collisionBox.getRectangle().getLineIntersectionPoint(startLine);
    const endPoint = edge.target.collisionBox.getRectangle().getLineIntersectionPoint(endLine);

    if (edge.text.trim() === "") {
      // 没有文字的边
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(startPoint),
        Renderer.transformWorld2View(shiftingMidPoint),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(shiftingMidPoint),
        Renderer.transformWorld2View(endPoint),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
    } else {
      // 有文字的边
      TextRenderer.renderTextFromCenter(
        edge.text,
        Renderer.transformWorld2View(shiftingMidPoint),
        Renderer.FONT_SIZE * Camera.currentScale,
      );
      const edgeTextRectangle = edge.textRectangle;
      const start2MidPoint = edgeTextRectangle.getLineIntersectionPoint(startLine);
      const mid2EndPoint = edgeTextRectangle.getLineIntersectionPoint(endLine);
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(startPoint),
        Renderer.transformWorld2View(start2MidPoint),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(mid2EndPoint),
        Renderer.transformWorld2View(endPoint),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
    }
    this.renderArrowHead(
      edge,
      edge.target.collisionBox.getRectangle().getCenter().subtract(shiftingMidPoint).normalize(),
      endPoint,
    );
  }
  private renderArrowHead(edge: LineEdge, direction: Vector, endPoint = edge.bodyLine.end.clone()) {
    const size = 15;
    EdgeRenderer.renderArrowHead(endPoint, direction, size, edge.color);
  }

  public renderCycleState(edge: LineEdge): void {
    // 自环
    ShapeRenderer.renderArc(
      Renderer.transformWorld2View(edge.target.collisionBox.getRectangle().location),
      (edge.target.collisionBox.getRectangle().size.y / 2) * Camera.currentScale,
      Math.PI / 2,
      0,
      new Color(204, 204, 204),
      2 * Camera.currentScale,
    );
    // 画箭头
    {
      const size = 15;
      const direction = new Vector(1, 0).rotateDegrees(15);
      const endPoint = edge.target.collisionBox.getRectangle().leftCenter;
      EdgeRenderer.renderArrowHead(endPoint, direction, size, edge.color);
    }
  }
  public getNormalStageSvg(edge: LineEdge): React.ReactNode {
    let lineBody = <></>;
    let textNode = <></>;
    const edgeColor = edge.color.equals(Color.Transparent)
      ? StageStyleManager.currentStyle.StageObjectBorderColor
      : edge.color;
    if (edge.text.trim() === "") {
      // 没有文字的边
      lineBody = (
        <line
          key={edge.source.uuid + "-" + edge.target.uuid}
          x1={edge.bodyLine.start.x}
          y1={edge.bodyLine.start.y}
          x2={edge.bodyLine.end.x}
          y2={edge.bodyLine.end.y}
          stroke={edgeColor.toString()}
          strokeWidth={2}
        />
      );
    } else {
      // 有文字的边
      const midPoint = edge.bodyLine.midPoint();
      const startHalf = new Line(edge.bodyLine.start, midPoint);
      const endHalf = new Line(midPoint, edge.bodyLine.end);
      textNode = (
        <text
          x={midPoint.x}
          y={midPoint.y}
          key={edge.uuid + "-text"}
          fill={edgeColor.toString()}
          fontSize={Renderer.FONT_SIZE}
          textAnchor="middle"
          fontFamily="MiSans"
        >
          {edge.text}
        </text>
      );
      lineBody = (
        <>
          <line
            key={edge.source.uuid + "-" + edge.target.uuid + "1"}
            x1={edge.bodyLine.start.x}
            y1={edge.bodyLine.start.y}
            x2={startHalf.end.x}
            y2={startHalf.end.y}
            stroke={edgeColor.toString()}
            strokeWidth={2}
          />
          <line
            key={edge.source.uuid + "-" + edge.target.uuid + "2"}
            x1={endHalf.end.x}
            y1={endHalf.end.y}
            x2={edge.bodyLine.end.x}
            y2={edge.bodyLine.end.y}
            stroke={edgeColor.toString()}
            strokeWidth={2}
          />
        </>
      );
    }
    // 加箭头
    const arrowHead = EdgeRenderer.generateArrowHeadSvg(
      edge.bodyLine.end.clone(),
      edge.target.collisionBox
        .getRectangle()
        .getCenter()
        .subtract(edge.source.collisionBox.getRectangle().getCenter())
        .normalize(),
      15,
      edgeColor,
    );
    return (
      <>
        {lineBody}
        {textNode}
        {arrowHead}
      </>
    );
  }
  public getCycleStageSvg(): React.ReactNode {
    return <></>;
  }
  public getShiftingStageSvg(): React.ReactNode {
    return <></>;
  }

  public renderVirtualEdge(startNode: ConnectableEntity, mouseLocation: Vector): void {
    CurveRenderer.renderGradientLine(
      Renderer.transformWorld2View(startNode.collisionBox.getRectangle().getCenter()),
      Renderer.transformWorld2View(mouseLocation),
      new Color(255, 255, 255, 0),
      new Color(255, 255, 255, 0.5),
      2,
    );
  }

  public renderVirtualConfirmedEdge(startNode: ConnectableEntity, endNode: ConnectableEntity): void {
    CurveRenderer.renderGradientLine(
      Renderer.transformWorld2View(startNode.collisionBox.getRectangle().getCenter()),
      Renderer.transformWorld2View(endNode.collisionBox.getRectangle().getCenter()),
      new Color(0, 255, 0, 0),
      new Color(0, 255, 0, 0.5),
      2,
    );
  }
}
