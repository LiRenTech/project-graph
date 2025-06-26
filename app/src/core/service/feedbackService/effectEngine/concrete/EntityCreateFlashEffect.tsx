import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Project } from "../../../../Project";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { Effect } from "../effectObject";

/**
 * 实体创建时闪光特效
 */
export class EntityCreateFlashEffect extends Effect {
  getClassName(): string {
    return "EntityCreateFlashEffect";
  }
  constructor(
    private readonly project: Project,
    /**
     * 一开始为0，每tick + 1
     */
    public override timeProgress: ProgressNumber,
    public rectangle: Rectangle,
    public radius: number,
    public color: Color = Color.White,
    public startBlurSize = 50,
  ) {
    super(timeProgress);
  }

  override tick() {
    super.tick();
  }

  /**
   * 常用的默认效果
   * @param rectangle
   * @returns
   */
  static fromRectangle(project: Project, rectangle: Rectangle) {
    return new EntityCreateFlashEffect(
      project,
      new ProgressNumber(0, 50),
      rectangle,
      Renderer.NODE_ROUNDED_RADIUS,
      StageStyleManager.currentStyle.effects.flash,
    );
  }

  static fromCreateEntity(project: Project, entity: Entity) {
    const result = new EntityCreateFlashEffect(
      project,
      new ProgressNumber(0, 15),
      entity.collisionBox.getRectangle(),
      Renderer.NODE_ROUNDED_RADIUS,
      StageStyleManager.currentStyle.effects.flash,
      100,
    );
    result.subEffects = [
      new EntityCreateFlashEffect(
        project,
        new ProgressNumber(0, 30),
        entity.collisionBox.getRectangle(),
        Renderer.NODE_ROUNDED_RADIUS,
        StageStyleManager.currentStyle.effects.successShadow,
        50,
      ),
      new EntityCreateFlashEffect(
        project,
        new ProgressNumber(0, 45),
        entity.collisionBox.getRectangle(),
        Renderer.NODE_ROUNDED_RADIUS,
        StageStyleManager.currentStyle.effects.successShadow,
        25,
      ),
    ];
    return result;
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    this.project.worldRenderUtils.renderRectangleFlash(
      this.project.renderer.transformWorld2View(this.rectangle),
      this.color,
      this.startBlurSize * this.project.camera.currentScale * (1 - this.timeProgress.rate),
      this.radius * this.project.camera.currentScale,
    );
    for (const subEffect of this.subEffects) {
      subEffect.render();
    }
  }
}
