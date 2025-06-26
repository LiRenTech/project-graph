import { Random } from "../../../../algorithm/random";
import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { EffectObject } from "../effectObject";

/**
 * 实体抖动特效
 * 在实体的外接矩形增加一个像“TickTock”Logo 一样的抖动特效
 * 可以用来表示提醒效果
 */
export class EntityShakeEffect extends EffectObject {
  getClassName(): string {
    return "EntityShakeEffect";
  }
  constructor(
    private readonly project: Project,
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
    this.shakeOffsetA = Random.randomVectorOnNormalCircle().multiply(alpha * maxOffsetDistance);
    this.shakeOffsetB = Random.randomVectorOnNormalCircle().multiply(alpha * maxOffsetDistance);
  }

  static fromEntity(project: Project, entity: Entity): EntityShakeEffect {
    return new EntityShakeEffect(project, 30, entity.collisionBox.getRectangle());
  }

  render(): void {
    const rectangleA = this.rect.clone();
    rectangleA.location = rectangleA.location.add(this.shakeOffsetA).add(Vector.same(-2));
    const rectangleB = this.rect.clone();
    rectangleB.location = rectangleB.location.add(this.shakeOffsetB).add(Vector.same(2));
    const fillAlpha = (1 - this.timeProgress.rate) / 2;
    this.project.shapeRenderer.renderRectWithShadow(
      this.project.renderer.transformWorld2View(rectangleA),
      new Color(255, 0, 0, fillAlpha),
      new Color(255, 0, 0, 0.2),
      2 * this.project.camera.currentScale,
      Color.Red,
      50 * this.project.camera.currentScale,
      0,
      0,
      Renderer.NODE_ROUNDED_RADIUS,
    );
    this.project.shapeRenderer.renderRectWithShadow(
      this.project.renderer.transformWorld2View(rectangleB),
      new Color(0, 0, 255, fillAlpha),
      new Color(0, 0, 255, 0.2),
      2 * this.project.camera.currentScale,
      Color.Blue,
      50 * this.project.camera.currentScale,
      0,
      0,
      Renderer.NODE_ROUNDED_RADIUS,
    );
  }
}
