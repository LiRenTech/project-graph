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
import { Section } from "../../../../../stage/stageObject/entity/Section";
import { SvgUtils } from "../../../../svg/SvgUtils";
import { CurveRenderer } from "../../../basicRenderer/curveRenderer";
import { ShapeRenderer } from "../../../basicRenderer/shapeRenderer";
import { TextRenderer } from "../../../basicRenderer/textRenderer";
import { Renderer } from "../../../renderer";
import { EdgeRenderer } from "../EdgeRenderer";
import { EdgeRendererClass } from "../EdgeRendererClass";

/**
 * 直线渲染器
 */
export class StraightEdgeRenderer extends EdgeRendererClass {
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

  public renderNormalState(edge: LineEdge): void {
    // 直线绘制
    const edgeColor = edge.color.equals(Color.Transparent)
      ? StageStyleManager.currentStyle.StageObjectBorder
      : edge.color;

    let edgeWidth = 2;
    if (edge.target instanceof Section && edge.source instanceof Section) {
      const rect1 = edge.source.collisionBox.getRectangle();
      const rect2 = edge.target.collisionBox.getRectangle();
      edgeWidth = Math.min(
        Math.min(Math.max(rect1.width, rect1.height), Math.max(rect2.width, rect2.height)) / 100,
        100,
      );
    }

    if (edge.text.trim() === "") {
      // 没有文字的边
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.start),
        Renderer.transformWorld2View(edge.bodyLine.end),
        edgeColor,
        edgeWidth * Camera.currentScale,
      );
    } else {
      // 有文字的边
      const midPoint = edge.bodyLine.midPoint();
      const startHalf = new Line(edge.bodyLine.start, midPoint);
      const endHalf = new Line(midPoint, edge.bodyLine.end);
      TextRenderer.renderMultiLineTextFromCenter(
        edge.text,
        Renderer.transformWorld2View(midPoint),
        Renderer.FONT_SIZE * Camera.currentScale,
        Infinity,
        edgeColor,
      );
      const edgeTextRectangle = edge.textRectangle;

      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.start),
        Renderer.transformWorld2View(edgeTextRectangle.getLineIntersectionPoint(startHalf)),
        edgeColor,
        edgeWidth * Camera.currentScale,
      );
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.end),
        Renderer.transformWorld2View(edgeTextRectangle.getLineIntersectionPoint(endHalf)),
        edgeColor,
        edgeWidth * Camera.currentScale,
      );
    }
    if (!(edge.target instanceof ConnectPoint)) {
      // 画箭头
      this.renderArrowHead(
        edge,
        edge.target.collisionBox
          .getRectangle()
          .getCenter()
          .subtract(edge.source.collisionBox.getRectangle().getCenter())
          .normalize(),
        edge.bodyLine.end.clone(),
        8 * edgeWidth,
      );
    }
  }

  public getNormalStageSvg(edge: LineEdge): React.ReactNode {
    let lineBody: React.ReactNode = <></>;
    let textNode: React.ReactNode = <></>;
    const edgeColor = edge.color.equals(Color.Transparent)
      ? StageStyleManager.currentStyle.StageObjectBorder
      : edge.color;
    if (edge.text.trim() === "") {
      // 没有文字的边
      lineBody = SvgUtils.line(edge.bodyLine.start, edge.bodyLine.end, edgeColor, 2);
    } else {
      // 有文字的边
      const midPoint = edge.bodyLine.midPoint();
      const startHalf = new Line(edge.bodyLine.start, midPoint);
      const endHalf = new Line(midPoint, edge.bodyLine.end);
      const edgeTextRectangle = edge.textRectangle;

      textNode = SvgUtils.textFromCenter(edge.text, midPoint, Renderer.FONT_SIZE, edgeColor);
      lineBody = (
        <>
          {SvgUtils.line(edge.bodyLine.start, edgeTextRectangle.getLineIntersectionPoint(startHalf), edgeColor, 2)}
          {SvgUtils.line(edge.bodyLine.end, edgeTextRectangle.getLineIntersectionPoint(endHalf), edgeColor, 2)}
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

  private renderArrowHead(edge: LineEdge, direction: Vector, endPoint = edge.bodyLine.end.clone(), size = 15) {
    const edgeColor = edge.color.equals(Color.Transparent)
      ? StageStyleManager.currentStyle.StageObjectBorder
      : edge.color;
    EdgeRenderer.renderArrowHead(endPoint, direction, size, edgeColor);
  }

  public renderShiftingState(edge: LineEdge): void {
    const shiftingMidPoint = edge.shiftingMidPoint;
    // 从source.Center到shiftingMidPoint的线
    const startLine = new Line(edge.source.collisionBox.getRectangle().center, shiftingMidPoint);
    const endLine = new Line(shiftingMidPoint, edge.target.collisionBox.getRectangle().center);
    const startPoint = edge.source.collisionBox.getRectangle().getLineIntersectionPoint(startLine);
    const endPoint = edge.target.collisionBox.getRectangle().getLineIntersectionPoint(endLine);
    const edgeColor = edge.color.equals(Color.Transparent)
      ? StageStyleManager.currentStyle.StageObjectBorder
      : edge.color;
    if (edge.text.trim() === "") {
      // 没有文字的边
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(startPoint),
        Renderer.transformWorld2View(shiftingMidPoint),
        edgeColor,
        2 * Camera.currentScale,
      );
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(shiftingMidPoint),
        Renderer.transformWorld2View(endPoint),
        edgeColor,
        2 * Camera.currentScale,
      );
    } else {
      // 有文字的边
      TextRenderer.renderTextFromCenter(
        edge.text,
        Renderer.transformWorld2View(shiftingMidPoint),
        Renderer.FONT_SIZE * Camera.currentScale,
        edgeColor,
      );
      const edgeTextRectangle = edge.textRectangle;
      const start2MidPoint = edgeTextRectangle.getLineIntersectionPoint(startLine);
      const mid2EndPoint = edgeTextRectangle.getLineIntersectionPoint(endLine);
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(startPoint),
        Renderer.transformWorld2View(start2MidPoint),
        edgeColor,
        2 * Camera.currentScale,
      );
      CurveRenderer.renderSolidLine(
        Renderer.transformWorld2View(mid2EndPoint),
        Renderer.transformWorld2View(endPoint),
        edgeColor,
        2 * Camera.currentScale,
      );
    }
    this.renderArrowHead(
      edge,
      edge.target.collisionBox.getRectangle().getCenter().subtract(shiftingMidPoint).normalize(),
      endPoint,
    );
  }

  public renderCycleState(edge: LineEdge): void {
    // 自环
    const edgeColor = edge.color.equals(Color.Transparent)
      ? StageStyleManager.currentStyle.StageObjectBorder
      : edge.color;
    ShapeRenderer.renderArc(
      Renderer.transformWorld2View(edge.target.collisionBox.getRectangle().location),
      (edge.target.collisionBox.getRectangle().size.y / 2) * Camera.currentScale,
      Math.PI / 2,
      0,
      edgeColor,
      2 * Camera.currentScale,
    );
    // 画箭头
    this.renderArrowHead(edge, new Vector(1, 0).rotateDegrees(15), edge.target.collisionBox.getRectangle().leftCenter);
    // 画文字
    if (edge.text.trim() === "") {
      // 没有文字的边
      return;
    }
    TextRenderer.renderTextFromCenter(
      edge.text,
      Renderer.transformWorld2View(edge.target.collisionBox.getRectangle().location.add(new Vector(0, -50))),
      Renderer.FONT_SIZE * Camera.currentScale,
      edgeColor,
    );
  }

  public renderVirtualEdge(startNode: ConnectableEntity, mouseLocation: Vector): void {
    CurveRenderer.renderGradientLine(
      Renderer.transformWorld2View(startNode.collisionBox.getRectangle().getCenter()),
      Renderer.transformWorld2View(mouseLocation),
      StageStyleManager.currentStyle.StageObjectBorder.toTransparent(),
      StageStyleManager.currentStyle.StageObjectBorder,
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
