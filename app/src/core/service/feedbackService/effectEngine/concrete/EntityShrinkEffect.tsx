import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { ShapeRenderer } from "../../../../render/canvas2d/basicRenderer/shapeRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";

/**
 * 实体收缩消失特效
 */
export class EntityShrinkEffect extends EffectObject {
  constructor(
    public time: number,
    public rect: Rectangle,
    public color: Color,
  ) {
    super(new ProgressNumber(0, time));
    this.originCenterLocation = rect.center;
  }
  private originCenterLocation = Vector.getZero();

  tick(): void {
    super.tick();
    this.rect.size = this.rect.size.multiply(0.95);

    const currentCenter = this.rect.center;
    this.rect.location = this.rect.location.add(this.originCenterLocation.subtract(currentCenter));
  }

  static fromEntity(entity: Entity): EntityShrinkEffect {
    let color = StageStyleManager.currentStyle.Background.clone();
    if (entity instanceof TextNode || entity instanceof Section) {
      color = entity.color.clone();
    }
    if (color.equals(Color.Transparent)) {
      color = StageStyleManager.currentStyle.Background.clone();
    }
    return new EntityShrinkEffect(10, entity.collisionBox.getRectangle(), color);
  }

  render(): void {
    const rectangleA = this.rect.clone();

    ShapeRenderer.renderRect(
      rectangleA.transformWorld2View(),
      this.color.toNewAlpha(1 - this.timeProgress.rate),
      StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
      2 * Camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * Camera.currentScale,
    );
  }
}
