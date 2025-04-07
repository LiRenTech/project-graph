import { Random } from "../../../../algorithm/random";
import { mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { RenderUtils } from "../../../../render/canvas2d/utilsRenderer/RenderUtils";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectParticle } from "../effectElements/effectParticle";
import { EffectObject } from "../effectObject";

export class EntityDashTipEffect extends EffectObject {
  getClassName(): string {
    return "EntityDashTipEffect";
  }
  constructor(
    public time: number,
    public rect: Rectangle,
  ) {
    super(new ProgressNumber(0, time));
    // 在矩形的每个边生成一些像素点，随机位置
    const countPreLine = 100;
    const initSpeedSize = 5;
    const initAccelerationSize = 0.5;
    // 顶边缘
    for (let i = 0; i < countPreLine; i++) {
      const pointLocation = new Vector(Random.randomFloat(rect.left, rect.right), rect.top);
      this.dashPoints.push(
        new EffectParticle(
          pointLocation,
          pointLocation.subtract(rect.center).normalize().multiply(Random.randomFloat(0, initSpeedSize)),
          rect.center.subtract(pointLocation).normalize().multiply(initAccelerationSize),
          StageStyleManager.currentStyle.effects.dash,
          1,
        ),
      );
    }
    // 右边缘
    for (let i = 0; i < countPreLine; i++) {
      const pointLocation = new Vector(rect.right, Random.randomFloat(rect.top, rect.bottom));
      this.dashPoints.push(
        new EffectParticle(
          pointLocation,
          pointLocation.subtract(rect.center).normalize().multiply(Random.randomFloat(0, initSpeedSize)),
          rect.center.subtract(pointLocation).normalize().multiply(initAccelerationSize),
          StageStyleManager.currentStyle.effects.dash,
          1,
        ),
      );
    }
    // 底边缘
    for (let i = 0; i < countPreLine; i++) {
      const pointLocation = new Vector(Random.randomFloat(rect.left, rect.right), rect.bottom);
      this.dashPoints.push(
        new EffectParticle(
          pointLocation,
          pointLocation.subtract(rect.center).normalize().multiply(Random.randomFloat(0, initSpeedSize)),
          rect.center.subtract(pointLocation).normalize().multiply(initAccelerationSize),
          StageStyleManager.currentStyle.effects.dash,
          1,
        ),
      );
    }
    // 左边缘
    for (let i = 0; i < countPreLine; i++) {
      const pointLocation = new Vector(rect.left, Random.randomFloat(rect.top, rect.bottom));
      this.dashPoints.push(
        new EffectParticle(
          pointLocation,
          pointLocation.subtract(rect.center).normalize().multiply(Random.randomFloat(0, initSpeedSize)),
          rect.center.subtract(pointLocation).normalize().multiply(initAccelerationSize),
          StageStyleManager.currentStyle.effects.dash,
          1,
        ),
      );
    }
  }

  private dashPoints: EffectParticle[] = [];

  tick(): void {
    super.tick();
    for (const point of this.dashPoints) {
      point.tick();
      // 粒子和矩形边缘碰撞
      if (this.rect.isPointIn(point.location)) {
        point.velocity = point.location.subtract(this.rect.center).normalize().multiply(Random.randomFloat(0, 5));
      }
    }
  }

  render(): void {
    for (const point of this.dashPoints) {
      RenderUtils.renderPixel(
        Renderer.transformWorld2View(point.location),
        mixColors(point.color, point.color.toTransparent(), this.timeProgress.rate),
      );
    }
  }
}
