import { Color } from "../../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../../dataStruct/ProgressNumber";
import { SymmetryCurve } from "../../../../../dataStruct/shape/Curve";
import { Line } from "../../../../../dataStruct/shape/Line";
import { Vector } from "../../../../../dataStruct/Vector";
import { CircleFlameEffect } from "../../../../../service/feedbackService/effectEngine/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../../../../service/feedbackService/effectEngine/concrete/LineCuttingEffect";
import { EffectObject } from "../../../../../service/feedbackService/effectEngine/effectObject";
import { StageStyleManager } from "../../../../../service/feedbackService/stageStyle/StageStyleManager";
import { Camera } from "../../../../../stage/Camera";
import { LineEdge } from "../../../../../stage/stageObject/association/LineEdge";
// import { ConnectPoint } from "../../../../../stage/stageObject/entity/ConnectPoint";
import { ConnectableEntity } from "../../../../../stage/stageObject/abstract/ConnectableEntity";
import { ShapeRenderer } from "../../../basicRenderer/shapeRenderer";
import { TextRenderer } from "../../../basicRenderer/textRenderer";
import { Renderer } from "../../../renderer";
import { WorldRenderUtils } from "../../../utilsRenderer/WorldRenderUtils";
import { EdgeRenderer } from "../EdgeRenderer";
import { EdgeRendererClass } from "../EdgeRendererClass";

export class SymmetryCurveEdgeRenderer extends EdgeRendererClass {
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
  ): EffectObject[] {
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

  public renderNormalState(edge: LineEdge): void {
    const start = edge.bodyLine.start;
    const end = edge.bodyLine.end;
    const curve = new SymmetryCurve(
      start,
      edge.source.collisionBox.getRectangle().getNormalVectorAt(start),
      end,
      edge.target.collisionBox.getRectangle().getNormalVectorAt(end),
      Math.abs(end.subtract(start).magnitude()) / 2,
    );
    // 曲线模式先不屏蔽箭头，有点不美观，空出来一段距离
    this.renderArrowCurve(curve);
    // if (!(edge.target instanceof ConnectPoint)) {
    //   this.renderArrowCurve(curve);
    // } else {
    //   this.renderCurveOnly(curve);
    // }
    this.renderText(curve, edge);
  }

  public renderShiftingState(edge: LineEdge): void {
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
    let startPoint = edge.source.collisionBox
      .getRectangle()
      .getLineIntersectionPoint(startLine);
    if (startPoint.equals(edge.source.collisionBox.getRectangle().center)) {
      startPoint = edge.source.collisionBox
        .getRectangle()
        .getLineIntersectionPoint(endLine);
    }
    let endPoint = edge.target.collisionBox
      .getRectangle()
      .getLineIntersectionPoint(endLine);
    if (endPoint.equals(edge.target.collisionBox.getRectangle().center)) {
      endPoint = edge.target.collisionBox
        .getRectangle()
        .getLineIntersectionPoint(startLine);
    }
    const curve = new SymmetryCurve(
      startPoint,
      startLine.direction(),
      endPoint,
      endLine.direction().multiply(-1),
      Math.abs(endPoint.subtract(startPoint).magnitude()) / 2,
    );
    this.renderArrowCurve(curve);
    this.renderText(curve, edge);
  }

  public renderCycleState(edge: LineEdge): void {
    // 自环
    ShapeRenderer.renderArc(
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
  public getNormalStageSvg(edge: LineEdge): React.ReactNode {
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
  public getCycleStageSvg(): React.ReactNode {
    return <></>;
  }
  public getShiftingStageSvg(): React.ReactNode {
    return <></>;
  }
  public renderVirtualEdge(
    startNode: ConnectableEntity,
    mouseLocation: Vector,
  ): void {
    const rect = startNode.collisionBox.getRectangle();
    const start = rect.getLineIntersectionPoint(
      new Line(rect.center, mouseLocation),
    );
    const end = mouseLocation;
    const direction = end.subtract(start);
    const endDirection = new Vector(
      Math.abs(direction.x) >= Math.abs(direction.y) ? direction.x : 0,
      Math.abs(direction.x) >= Math.abs(direction.y) ? 0 : direction.y,
    )
      .normalize()
      .multiply(-1);
    this.renderArrowCurve(
      new SymmetryCurve(
        start,
        rect.getNormalVectorAt(start),
        end,
        endDirection,
        Math.abs(end.subtract(start).magnitude()) / 2,
      ),
    );
  }

  public renderVirtualConfirmedEdge(
    startNode: ConnectableEntity,
    endNode: ConnectableEntity,
  ): void {
    const startRect = startNode.collisionBox.getRectangle();
    const endRect = endNode.collisionBox.getRectangle();
    const line = new Line(startRect.center, endRect.center);
    const start = startRect.getLineIntersectionPoint(line);
    const end = endRect.getLineIntersectionPoint(line);
    this.renderArrowCurve(
      new SymmetryCurve(
        start,
        startRect.getNormalVectorAt(start),
        end,
        endRect.getNormalVectorAt(end),
        Math.abs(end.subtract(start).magnitude()) / 2,
      ),
    );
  }

  /**
   * 渲染curve及箭头,curve.end即箭头头部
   * @param curve
   */
  private renderArrowCurve(curve: SymmetryCurve): void {
    // 绘制曲线本体
    curve.endDirection = curve.endDirection.normalize();
    const end = curve.end.clone();
    const size = 15; // 箭头大小
    curve.end = curve.end.subtract(curve.endDirection.multiply(size / -2));
    // 绘制碰撞箱
    // const segment = 40;
    // let lastPoint = curve.start;
    // for (let i = 1; i <= segment; i++) {
    //   const line = new Line(lastPoint, curve.bezier.getPointByT(i / segment));
    //   CurveRenderer.renderSolidLine(
    //     Renderer.transformWorld2View(line.start),
    //     Renderer.transformWorld2View(line.end),
    //     new Color(0, 104, 0),
    //     10 * Camera.currentScale
    //   )
    //   lastPoint = line.end;
    // }
    WorldRenderUtils.renderSymmetryCurve(curve, new Color(204, 204, 204), 2);
    // 画箭头
    const endPoint = end.add(curve.endDirection.multiply(2));
    EdgeRenderer.renderArrowHead(
      endPoint,
      curve.endDirection.multiply(-1),
      size,
    );
  }
  // /**
  //  * 仅仅绘制曲线
  //  * @param curve
  //  */
  // private renderCurveOnly(curve: SymmetryCurve): void {
  //   // 绘制曲线本体
  //   curve.endDirection = curve.endDirection.normalize();
  //   const end = curve.end.clone();
  //   const size = 15; // 箭头大小
  //   curve.end = curve.end.subtract(curve.endDirection.multiply(size / -2));
  //   WorldRenderUtils.renderSymmetryCurve(curve, new Color(204, 204, 204), 2);
  // }

  private renderText(curve: SymmetryCurve, edge: LineEdge): void {
    if (edge.text.trim() === "") {
      return;
    }
    // 画文本
    ShapeRenderer.renderRect(
      edge.textRectangle.transformWorld2View(),
      new Color(31, 31, 31, 0.5),
      new Color(31, 31, 31, 0.5),
      1,
    );
    TextRenderer.renderTextFromCenter(
      edge.text,
      Renderer.transformWorld2View(curve.bezier.getPointByT(0.5)),
      Renderer.FONT_SIZE * Camera.currentScale,
    );
  }
}
