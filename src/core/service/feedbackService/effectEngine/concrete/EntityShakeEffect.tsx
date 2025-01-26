import { Random } from "../../../../algorithm/random";
import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { ShapeRenderer } from "../../../../render/canvas2d/basicRenderer/shapeRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { Entity } from "../../../../stage/stageObject/StageObject";
import { EffectObject } from "../effectObject";

/**
 * 实体抖动特效
 * 在实体的外接矩形增加一个像“TickTock”Logo 一样的抖动特效
 * 可以用来表示提醒效果
 */
export class EntityShakeEffect extends EffectObject {
  constructor(
    public time: number,
    public rect: Rectangle,
  ) {
    super(new ProgressNumber(0, time));
  }

  private shakeOffsetA: Vector = Vector.getZero();
  private shakeOffsetB: Vector = Vector.getZero();

  tick(): void {
    super.tick();
    const alpha = 1 - this.timeProgress.rate;
    const maxOffsetDistance = 10;
    this.shakeOffsetA = Random.randomVectorOnNormalCircle().multiply(
      alpha * maxOffsetDistance,
    );
    this.shakeOffsetB = Random.randomVectorOnNormalCircle().multiply(
      alpha * maxOffsetDistance,
    );
  }

  static fromEntity(entity: Entity): EntityShakeEffect {
    return new EntityShakeEffect(30, entity.collisionBox.getRectangle());
  }

  render(): void {
    const rectangleA = this.rect.clone();
    rectangleA.location = rectangleA.location
      .add(this.shakeOffsetA)
      .add(Vector.same(-2));
    const rectangleB = this.rect.clone();
    rectangleB.location = rectangleB.location
      .add(this.shakeOffsetB)
      .add(Vector.same(2));
    const fillAlpha = (1 - this.timeProgress.rate) / 2;
    ShapeRenderer.renderRectWithShadow(
      rectangleA.transformWorld2View(),
      new Color(255, 0, 0, fillAlpha),
      new Color(255, 0, 0, 0.2),
      2 * Camera.currentScale,
      Color.Red,
      50 * Camera.currentScale,
      0,
      0,
      Renderer.NODE_ROUNDED_RADIUS,
    );
    ShapeRenderer.renderRectWithShadow(
      rectangleB.transformWorld2View(),
      new Color(0, 0, 255, fillAlpha),
      new Color(0, 0, 255, 0.2),
      2 * Camera.currentScale,
      Color.Blue,
      50 * Camera.currentScale,
      0,
      0,
      Renderer.NODE_ROUNDED_RADIUS,
    );
  }
}
