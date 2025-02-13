import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { WorldRenderUtils } from "../../../../render/canvas2d/utilsRenderer/WorldRenderUtils";
import { Camera } from "../../../../stage/Camera";
import { Entity } from "../../../../stage/stageObject/abstract/StageEntity";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";

/**
 * 实体创建时闪光特效
 */
export class EntityCreateFlashEffect extends EffectObject {
  constructor(
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
  static fromRectangle(rectangle: Rectangle) {
    return new EntityCreateFlashEffect(
      new ProgressNumber(0, 50),
      rectangle,
      Renderer.NODE_ROUNDED_RADIUS,
      StageStyleManager.currentStyle.effects.flash,
    );
  }

  static fromCreateEntity(entity: Entity) {
    const result = new EntityCreateFlashEffect(
      new ProgressNumber(0, 15),
      entity.collisionBox.getRectangle(),
      Renderer.NODE_ROUNDED_RADIUS,
      StageStyleManager.currentStyle.effects.flash,
      100,
    );
    result.subEffects = [
      new EntityCreateFlashEffect(
        new ProgressNumber(0, 30),
        entity.collisionBox.getRectangle(),
        Renderer.NODE_ROUNDED_RADIUS,
        StageStyleManager.currentStyle.effects.successShadow,
        50,
      ),
      new EntityCreateFlashEffect(
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
    WorldRenderUtils.renderRectangleFlash(
      this.rectangle.transformWorld2View(),
      this.color,
      this.startBlurSize * Camera.currentScale * (1 - this.timeProgress.rate),
      this.radius * Camera.currentScale,
    );
    for (const subEffect of this.subEffects) {
      subEffect.render();
    }
  }
}
