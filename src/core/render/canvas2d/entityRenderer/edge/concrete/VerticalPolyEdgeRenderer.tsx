import { Color } from "../../../../../dataStruct/Color";
import { Line } from "../../../../../dataStruct/shape/Line";
import { ProgressNumber } from "../../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../../dataStruct/Vector";
import { Edge } from "../../../../../stageObject/association/Edge";
import { CircleFlameEffect } from "../../../../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../../../../effect/concrete/LineCuttingEffect";
import { Effect } from "../../../../../effect/effect";
import { Camera } from "../../../../../stage/Camera";
import { Renderer } from "../../../renderer";
import { RenderUtils } from "../../../RenderUtils";
import { EdgeRenderer } from "../EdgeRenderer";
import { EdgeRendererClass } from "../EdgeRendererClass";
import { ConnectableEntity } from "../../../../../stageObject/StageObject";
import { StageStyleManager } from "../../../../../stageStyle/StageStyleManager";

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
      new CircleFlameEffect(
        new ProgressNumber(0, 15),
        edge.bodyLine.midPoint(),
        50,
        new Color(255, 0, 0, 1),
      ),
    ];
  }

  getConnectedEffects(
    startNode: ConnectableEntity,
    toNode: ConnectableEntity,
  ): Effect[] {
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
  getVerticalDirection(edge: Edge): Vector {
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
  renderTest(edge: Edge) {
    for (let i = 0; i < 4; i++) {
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(
          edge.target.collisionBox.getRectangle().center,
        ),
        Renderer.transformWorld2View(
          edge.target.collisionBox
            .getRectangle()
            .center.add(new Vector(100, 0).rotateDegrees(45 + 90 * i)),
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
            edge.target.collisionBox.getRectangle().center.x -
              edge.source.collisionBox.getRectangle().center.x,
          );
        // 左右偏离距离 恒正
        const distance =
          (rate * edge.target.collisionBox.getRectangle().size.x) / 2;
        // 根据偏移距离计算附加高度  恒正
        const h =
          (edge.target.collisionBox.getRectangle().size.x / 2) * (1 - rate);
        // 终点
        const p1 = new Vector(
          edge.target.collisionBox.getRectangle().center.x +
            distance *
              (edge.source.collisionBox.getRectangle().center.x >
              edge.target.collisionBox.getRectangle().center.x
                ? 1
                : -1),
          verticalDirection.y > 0
            ? edge.target.collisionBox.getRectangle().top
            : edge.target.collisionBox.getRectangle().bottom,
        );
        const length =
          (this.fixedLength + h) * (verticalDirection.y > 0 ? -1 : 1);
        const p2 = p1.add(new Vector(0, length));

        const p4 = new Vector(
          edge.source.collisionBox.getRectangle().center.x,
          verticalDirection.y > 0
            ? edge.source.collisionBox.getRectangle().bottom
            : edge.source.collisionBox.getRectangle().top,
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
            edge.target.collisionBox.getRectangle().center.y -
              edge.source.collisionBox.getRectangle().center.y,
          );
        // 偏离距离 恒正
        const distance =
          (rate * edge.target.collisionBox.getRectangle().size.y) / 2;
        // 根据偏移距离计算附加高度
        const h =
          (edge.target.collisionBox.getRectangle().size.y / 2) * (1 - rate);
        // 终点
        const p1 = new Vector(
          verticalDirection.x > 0
            ? edge.target.collisionBox.getRectangle().left
            : edge.target.collisionBox.getRectangle().right,
          edge.target.collisionBox.getRectangle().center.y +
            distance *
              (edge.source.collisionBox.getRectangle().center.y >
              edge.target.collisionBox.getRectangle().center.y
                ? 1
                : -1),
        );
        // length 是固定长度+h
        const length =
          (this.fixedLength + h) * (verticalDirection.x > 0 ? -1 : 1);
        const p2 = p1.add(new Vector(length, 0));

        const p4 = new Vector(
          verticalDirection.x > 0
            ? edge.source.collisionBox.getRectangle().right
            : edge.source.collisionBox.getRectangle().left,
          edge.source.collisionBox.getRectangle().center.y,
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
        const direction = edge.target.collisionBox
          .getRectangle()
          .getCenter()
          .subtract(edge.source.collisionBox.getRectangle().getCenter())
          .normalize();
        const endPoint = edge.bodyLine.end.clone();
        EdgeRenderer.renderArrowHead(endPoint, direction, size);
      }
    }
  }
  public renderShiftingState(edge: Edge): void {
    const shiftingMidPoint = edge.shiftingMidPoint;
    // 从source.Center到shiftingMidPoint的线
    const startLine = new Line(
      edge.source.collisionBox.getRectangle().center,
      shiftingMidPoint,
    );
    const endLine = new Line(
      shiftingMidPoint,
      edge.target.collisionBox.getRectangle().center,
    );
    const startPoint = edge.source.collisionBox
      .getRectangle()
      .getLineIntersectionPoint(startLine);
    const endPoint = edge.target.collisionBox
      .getRectangle()
      .getLineIntersectionPoint(endLine);

    if (edge.text.trim() === "") {
      // 没有文字的边
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(startPoint),
        Renderer.transformWorld2View(shiftingMidPoint),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(shiftingMidPoint),
        Renderer.transformWorld2View(endPoint),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
    } else {
      // 有文字的边
      RenderUtils.renderTextFromCenter(
        edge.text,
        Renderer.transformWorld2View(shiftingMidPoint),
        Renderer.FONT_SIZE * Camera.currentScale,
      );
      const edgeTextRectangle = edge.textRectangle;
      const start2MidPoint =
        edgeTextRectangle.getLineIntersectionPoint(startLine);
      const mid2EndPoint = edgeTextRectangle.getLineIntersectionPoint(endLine);
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(startPoint),
        Renderer.transformWorld2View(start2MidPoint),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(mid2EndPoint),
        Renderer.transformWorld2View(endPoint),
        new Color(204, 204, 204),
        2 * Camera.currentScale,
      );
    }
    this.renderArrowHead(
      edge,
      edge.target.collisionBox
        .getRectangle()
        .getCenter()
        .subtract(shiftingMidPoint)
        .normalize(),
      endPoint,
    );
  }
  private renderArrowHead(
    edge: Edge,
    direction: Vector,
    endPoint = edge.bodyLine.end.clone(),
  ) {
    const size = 15;
    EdgeRenderer.renderArrowHead(endPoint, direction, size);
  }

  public renderCycleState(edge: Edge): void {
    // 自环
    RenderUtils.renderArc(
      Renderer.transformWorld2View(
        edge.target.collisionBox.getRectangle().location,
      ),
      (edge.target.collisionBox.getRectangle().size.y / 2) *
        Camera.currentScale,
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
      EdgeRenderer.renderArrowHead(endPoint, direction, size);
    }
  }
  public getNormalStageSvg(edge: Edge): React.ReactNode {
    let lineBody = <></>;
    let textNode = <></>;
    if (edge.text.trim() === "") {
      // 没有文字的边
      lineBody = (
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
          fill={StageStyleManager.currentStyle.StageObjectBorderColor.toString()}
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
            stroke={StageStyleManager.currentStyle.StageObjectBorderColor.toString()}
            strokeWidth={2}
          />
          <line
            key={edge.source.uuid + "-" + edge.target.uuid + "2"}
            x1={endHalf.end.x}
            y1={endHalf.end.y}
            x2={edge.bodyLine.end.x}
            y2={edge.bodyLine.end.y}
            stroke={StageStyleManager.currentStyle.StageObjectBorderColor.toString()}
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
    );
    return (
      <>
        {lineBody}
        {textNode}
        {arrowHead}
      </>
    );
  }
  public getCycleStageSvg(edge: Edge): React.ReactNode {
    console.log(edge);
    return <></>;
  }
  public getShiftingStageSvg(edge: Edge): React.ReactNode {
    console.log(edge);
    return <></>;
  }

  public renderVirtualEdge(
    startNode: ConnectableEntity,
    mouseLocation: Vector,
  ): void {
    RenderUtils.renderGradientLine(
      Renderer.transformWorld2View(
        startNode.collisionBox.getRectangle().getCenter(),
      ),
      Renderer.transformWorld2View(mouseLocation),
      new Color(255, 255, 255, 0),
      new Color(255, 255, 255, 0.5),
      2,
    );
  }

  public renderVirtualConfirmedEdge(
    startNode: ConnectableEntity,
    endNode: ConnectableEntity,
  ): void {
    RenderUtils.renderGradientLine(
      Renderer.transformWorld2View(
        startNode.collisionBox.getRectangle().getCenter(),
      ),
      Renderer.transformWorld2View(
        endNode.collisionBox.getRectangle().getCenter(),
      ),
      new Color(0, 255, 0, 0),
      new Color(0, 255, 0, 0.5),
      2,
    );
  }
}
