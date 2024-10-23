import { Color } from "../../../../../dataStruct/Color";
import { SymmetryCurve } from "../../../../../dataStruct/shape/Curve";
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
import { WorldRenderUtils } from "../../../WorldRenderUtils";

export class SymmetryCurveEdgeRenderer extends EdgeRendererClass {
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

  public renderNormalState(edge: Edge): void {
    // 绘制曲线本体
    const start = edge.bodyLine.start;
    const end = edge.bodyLine.end;
    const direction = end.subtract(start);
    // const startDirection = new Vector(
    //   Math.abs(direction.x) >= Math.abs(direction.y) ? direction.x : 0,
    //   Math.abs(direction.x) >= Math.abs(direction.y) ? 0 : direction.y,
    // ).normalize();
    const size = 15; // 箭头大小
    const endNormal = edge.target.rectangle.getNormalVectorAt(end);
    const curve = new SymmetryCurve(
      start,
      edge.source.rectangle.getNormalVectorAt(start),
      end.subtract(endNormal.multiply(size / -2)),
      endNormal,
      Math.abs(direction.magnitude()) / 2,
    );
    WorldRenderUtils.renderSymmetryCurve(
      curve,
      new Color(204, 204, 204),
      2,
    );
    // 画箭头
    const endPoint = edge.bodyLine.end
      .clone()
      .add(endNormal.multiply(2));
    EdgeRenderer.renderArrowHead(endPoint, endNormal.multiply(-1), size);
    // 画文本
    RenderUtils.renderTextFromCenter(
      edge.text,
      Renderer.transformWorld2View(edge.bodyLine.midPoint()),
      Renderer.FONT_SIZE * Camera.currentScale,
    );
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
    // 绘制曲线本体
    const start = Renderer.transformWorld2View(startNode.rectangle.center);
    const end = Renderer.transformWorld2View(mouseLocation);
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
  }

  public renderVirtualConfirmedEdge(startNode: TextNode, endNode: TextNode): void {
    const start = Renderer.transformWorld2View(startNode.rectangle.center);
    const end = Renderer.transformWorld2View(endNode.rectangle.center);
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
      new Color(0, 204, 0),
      2 * Camera.currentScale,
    );
  }
}
