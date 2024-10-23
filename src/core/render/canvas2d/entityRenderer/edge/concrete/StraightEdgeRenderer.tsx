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

/**
 * 直线渲染器
 */
export class StraightEdgeRenderer extends EdgeRendererClass {
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

  getConnectedEffects(startNode: ConnectableEntity, toNode: ConnectableEntity): Effect[] {
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

  public renderNormalState(edge: Edge): void {
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
      const direction = edge.target.collisionBox.getRectangle()
        .getCenter()
        .subtract(edge.source.collisionBox.getRectangle().getCenter())
        .normalize();
      const endPoint = edge.bodyLine.end.clone();
      EdgeRenderer.renderArrowHead(endPoint, direction, size);
    }
  }

  public renderCycleState(edge: Edge): void {
    // 自环
    RenderUtils.renderArc(
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
      EdgeRenderer.renderArrowHead(endPoint, direction, size);
    }
  }

  public renderVirtualEdge(startNode: ConnectableEntity, mouseLocation: Vector): void {
    RenderUtils.renderGradientLine(
      Renderer.transformWorld2View(startNode.collisionBox.getRectangle().getCenter()),
      Renderer.transformWorld2View(mouseLocation),
      new Color(255, 255, 255, 0),
      new Color(255, 255, 255, 0.5),
      2,
    );
  }

  public renderVirtualConfirmedEdge(startNode: ConnectableEntity, endNode: ConnectableEntity): void {
    RenderUtils.renderGradientLine(
      Renderer.transformWorld2View(startNode.collisionBox.getRectangle().getCenter()),
      Renderer.transformWorld2View(endNode.collisionBox.getRectangle().getCenter()),
      new Color(0, 255, 0, 0),
      new Color(0, 255, 0, 0.5),
      2,
    );
  }
}
