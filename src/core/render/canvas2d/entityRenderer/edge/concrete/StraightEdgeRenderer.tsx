import { Color } from "../../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../../dataStruct/ProgressNumber";
import { Line } from "../../../../../dataStruct/shape/Line";
import { Vector } from "../../../../../dataStruct/Vector";
import { CircleFlameEffect } from "../../../../../effect/concrete/CircleFlameEffect";
import { LineCuttingEffect } from "../../../../../effect/concrete/LineCuttingEffect";
import { Effect } from "../../../../../effect/effect";
import { Camera } from "../../../../../stage/Camera";
import { LineEdge } from "../../../../../stageObject/association/LineEdge";
import { ConnectPoint } from "../../../../../stageObject/entity/ConnectPoint";
import { ConnectableEntity } from "../../../../../stageObject/StageObject";
import { StageStyleManager } from "../../../../../stageStyle/StageStyleManager";
import { SvgUtils } from "../../../../svg/SvgUtils";
import { Renderer } from "../../../renderer";
import { RenderUtils } from "../../../RenderUtils";
import { EdgeRenderer } from "../EdgeRenderer";
import { EdgeRendererClass } from "../EdgeRendererClass";

/**
 * 直线渲染器
 */
export class StraightEdgeRenderer extends EdgeRendererClass {
  getCuttingEffects(edge: LineEdge): Effect[] {
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

  public renderNormalState(edge: LineEdge): void {
    // 直线绘制
    if (edge.text.trim() === "") {
      // 没有文字的边
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.start),
        Renderer.transformWorld2View(edge.bodyLine.end),
        StageStyleManager.currentStyle.StageObjectBorderColor,
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
        StageStyleManager.currentStyle.StageObjectBorderColor,
      );
      const edgeTextRectangle = edge.textRectangle;

      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.start),
        Renderer.transformWorld2View(
          edgeTextRectangle.getLineIntersectionPoint(startHalf),
        ),
        StageStyleManager.currentStyle.StageObjectBorderColor,
        2 * Camera.currentScale,
      );
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(edge.bodyLine.end),
        Renderer.transformWorld2View(
          edgeTextRectangle.getLineIntersectionPoint(endHalf),
        ),
        StageStyleManager.currentStyle.StageObjectBorderColor,
        2 * Camera.currentScale,
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
      );
    }
  }

  public getNormalStageSvg(edge: LineEdge): React.ReactNode {
    let lineBody: React.ReactNode = <></>;
    let textNode: React.ReactNode = <></>;
    if (edge.text.trim() === "") {
      // 没有文字的边
      lineBody = SvgUtils.line(
        edge.bodyLine.start,
        edge.bodyLine.end,
        StageStyleManager.currentStyle.StageObjectBorderColor,
        2,
      );
    } else {
      // 有文字的边
      const midPoint = edge.bodyLine.midPoint();
      const startHalf = new Line(edge.bodyLine.start, midPoint);
      const endHalf = new Line(midPoint, edge.bodyLine.end);
      const edgeTextRectangle = edge.textRectangle;

      textNode = SvgUtils.textFromCenter(
        edge.text,
        midPoint,
        Renderer.FONT_SIZE,
        StageStyleManager.currentStyle.StageObjectBorderColor,
      );
      lineBody = (
        <>
          {SvgUtils.line(
            edge.bodyLine.start,
            edgeTextRectangle.getLineIntersectionPoint(startHalf),
            StageStyleManager.currentStyle.StageObjectBorderColor,
            2,
          )}
          {SvgUtils.line(
            edge.bodyLine.end,
            edgeTextRectangle.getLineIntersectionPoint(endHalf),
            StageStyleManager.currentStyle.StageObjectBorderColor,
            2,
          )}
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

  private renderArrowHead(
    edge: LineEdge,
    direction: Vector,
    endPoint = edge.bodyLine.end.clone(),
  ) {
    const size = 15;
    EdgeRenderer.renderArrowHead(endPoint, direction, size);
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
        StageStyleManager.currentStyle.StageObjectBorderColor,
        2 * Camera.currentScale,
      );
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(shiftingMidPoint),
        Renderer.transformWorld2View(endPoint),
        StageStyleManager.currentStyle.StageObjectBorderColor,
        2 * Camera.currentScale,
      );
    } else {
      // 有文字的边
      RenderUtils.renderTextFromCenter(
        edge.text,
        Renderer.transformWorld2View(shiftingMidPoint),
        Renderer.FONT_SIZE * Camera.currentScale,
        StageStyleManager.currentStyle.StageObjectBorderColor,
      );
      const edgeTextRectangle = edge.textRectangle;
      const start2MidPoint =
        edgeTextRectangle.getLineIntersectionPoint(startLine);
      const mid2EndPoint = edgeTextRectangle.getLineIntersectionPoint(endLine);
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(startPoint),
        Renderer.transformWorld2View(start2MidPoint),
        StageStyleManager.currentStyle.StageObjectBorderColor,
        2 * Camera.currentScale,
      );
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(mid2EndPoint),
        Renderer.transformWorld2View(endPoint),
        StageStyleManager.currentStyle.StageObjectBorderColor,
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

  public renderCycleState(edge: LineEdge): void {
    // 自环
    RenderUtils.renderArc(
      Renderer.transformWorld2View(
        edge.target.collisionBox.getRectangle().location,
      ),
      (edge.target.collisionBox.getRectangle().size.y / 2) *
        Camera.currentScale,
      Math.PI / 2,
      0,
      StageStyleManager.currentStyle.StageObjectBorderColor,
      2 * Camera.currentScale,
    );
    // 画箭头
    this.renderArrowHead(
      edge,
      new Vector(1, 0).rotateDegrees(15),
      edge.target.collisionBox.getRectangle().leftCenter,
    );
    // 画文字
    if (edge.text.trim() === "") {
      // 没有文字的边
      return;
    }
    RenderUtils.renderTextFromCenter(
      edge.text,
      Renderer.transformWorld2View(
        edge.target.collisionBox
          .getRectangle()
          .location.add(new Vector(0, -50)),
      ),
      Renderer.FONT_SIZE * Camera.currentScale,
      StageStyleManager.currentStyle.StageObjectBorderColor,
    );
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
      StageStyleManager.currentStyle.StageObjectBorderColor.toTransparent(),
      StageStyleManager.currentStyle.StageObjectBorderColor,
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
