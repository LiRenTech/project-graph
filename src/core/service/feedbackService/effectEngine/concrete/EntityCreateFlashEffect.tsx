import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { WorldRenderUtils } from "../../../../render/canvas2d/utilsRenderer/WorldRenderUtils";
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
  ) {
    super(timeProgress);
  }

  override tick() {
    super.tick();
  }

  static fromRectangle(rectangle: Rectangle) {
    return new EntityCreateFlashEffect(new ProgressNumber(0, 1000), rectangle);
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    WorldRenderUtils.renderRectangleFlash(this.rectangle, Color.White, 50 * (1 - this.timeProgress.rate));
  }
}
