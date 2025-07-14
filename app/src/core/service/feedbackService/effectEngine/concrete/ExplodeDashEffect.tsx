import { Random } from "../../../../algorithm/random";
import { Color, mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { RenderUtils } from "../../../../render/canvas2d/utilsRenderer/RenderUtils";
import { Stage } from "../../../../stage/Stage";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";

/**
 * 方块的爆炸粉尘效果
 */
export class ExplodeDashEffect extends EffectObject {
  getClassName(): string {
    return "ExplodeDashEffect";
  }
  ashLocationArray: Vector[] = [];
  ashSpeedArray: Vector[] = [];

  private getDashCountPreEntity(): number {
    // 说明是按Delete删除的
    if (Stage.cuttingMachine.warningEntity.length === 0) {
      return 0;
    }

    // 说明是按鼠标删除的，可以多一些
    return Math.floor(1000 / Stage.cuttingMachine.warningEntity.length);
  }

  constructor(
    /**
     * 一开始为0，每tick + 1
     */
    public override timeProgress: ProgressNumber,
    public rectangle: Rectangle,
    public color: Color,
  ) {
    super(timeProgress);
    for (let i = 0; i < this.getDashCountPreEntity(); i++) {
      this.ashLocationArray.push(
        new Vector(
          Random.randomFloat(rectangle.left, rectangle.right),
          Random.randomFloat(rectangle.top, rectangle.bottom),
        ),
      );
      this.ashSpeedArray.push(
        this.ashLocationArray[i].subtract(this.rectangle.center).normalize().multiply(Random.randomFloat(0.5, 10)),
      );
    }
  }

  override tick() {
    super.tick();
    for (let i = 0; i < this.ashLocationArray.length; i++) {
      this.ashLocationArray[i] = this.ashLocationArray[i].add(this.ashSpeedArray[i]);
    }
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    for (const ashLocation of this.ashLocationArray) {
      const viewLocation = Renderer.transformWorld2View(ashLocation);
      const color = mixColors(
        StageStyleManager.currentStyle.StageObjectBorder,
        StageStyleManager.currentStyle.StageObjectBorder.toTransparent(),
        this.timeProgress.rate,
      );

      RenderUtils.renderPixel(viewLocation, color);
    }
  }
}
