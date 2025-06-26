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
    private readonly project: Project,
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

  static fromEntity(project: Project, entity: Entity): EntityShrinkEffect {
    let color = StageStyleManager.currentStyle.Background.clone();
    if (entity instanceof TextNode || entity instanceof Section) {
      color = entity.color.clone();
    }
    if (color.equals(Color.Transparent)) {
      color = StageStyleManager.currentStyle.Background.clone();
    }
    return new EntityShrinkEffect(project, 10, entity.collisionBox.getRectangle(), color);
  }

  render(): void {
    const rectangleA = this.rect.clone();

    this.project.shapeRenderer.renderRect(
      this.project.renderer.transformWorld2View(rectangleA),
      this.color.toNewAlpha(1 - this.timeProgress.rate),
      StageStyleManager.currentStyle.StageObjectBorder.toNewAlpha(1 - this.timeProgress.rate),
      2 * this.project.camera.currentScale,
      Renderer.NODE_ROUNDED_RADIUS * this.project.camera.currentScale,
    );
  }
}
