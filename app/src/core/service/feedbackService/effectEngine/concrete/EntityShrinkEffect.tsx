import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { Section } from "../../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { Effect } from "../effectObject";

/**
 * 实体收缩消失特效
 */
export class EntityShrinkEffect extends Effect {
  getClassName(): string {
    return "EntityShrinkEffect";
  }
  constructor(
    public time: number,
    public rect: Rectangle,
    public color: Color,
  ) {
    super(new ProgressNumber(0, time));
    this.originCenterLocation = rect.center;
  }
  private originCenterLocation = Vector.getZero();

  override tick(project: Project) {
    super.tick(project);
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

  render(project: Project) {
    const rectangleA = this.rect.clone();

    project.shapeRenderer.renderRect(
      project.renderer.transformWorld2View(rectangleA),
      this.color.toNewAlpha(1 - this.timeProgress.rate),
      StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
      2 * project.camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * project.camera.currentScale,
    );
  }
}
