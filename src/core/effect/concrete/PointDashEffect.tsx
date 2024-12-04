import { Color, mixColors } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { RenderUtils } from "../../render/canvas2d/RenderUtils";
import { StageManager } from "../../stage/stageManager/StageManager";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { Effect } from "../effect";
import { EffectParticle } from "../effectParticle";

/**
 * 在一个点迸发一些粒子效果
 */
export class PointDashEffect extends Effect {
  public particleList: EffectParticle[] = [];

  constructor(
    public override timeProgress: ProgressNumber,
    public location: Vector,
    public particleCount: number,
  ) {
    super(timeProgress);
    for (let i = 0; i < particleCount; i++) {
      this.particleList.push(
        // 随机粒子
        new EffectParticle(
          this.location.clone(),
          Vector.fromDegrees(Math.random() * 360).multiply(Math.random() * 1),
          Vector.getZero(),
          StageStyleManager.currentStyle.StageObjectBorderColor,
          1,
        ),
      );
    }
  }

  override tick() {
    super.tick();
    for (const particle of this.particleList) {
      // 让粒子的加速度为一些节点
      let acceleration = Vector.getZero();

      let isCollideWithEntity = false;

      for (const connectEntity of StageManager.getConnectableEntity()) {
        const connectEntityCenter =
          connectEntity.collisionBox.getRectangle().center;
        const distance = connectEntityCenter.subtract(particle.location);
        const normalizedDistance = distance
          .normalize()
          .multiply(20 / distance.magnitude() ** 1.2);
        acceleration = acceleration.add(normalizedDistance);

        if (
          connectEntity.collisionBox.isPointInCollisionBox(particle.location)
        ) {
          // 粒子碰到实体
          isCollideWithEntity = true;
        }
      }
      if (isCollideWithEntity) {
        particle.color = Color.Green;
      } else {
        particle.color = mixColors(
          StageStyleManager.currentStyle.StageObjectBorderColor,
          StageStyleManager.currentStyle.StageObjectBorderColor.toTransparent(),
          this.timeProgress.rate,
        );
      }
      particle.acceleration = acceleration;

      particle.tick();
    }
  }

  static fromMouseEffect(
    mouseWorldLocation: Vector,
    count: number,
  ): PointDashEffect {
    return new PointDashEffect(
      new ProgressNumber(0, 50),
      mouseWorldLocation,
      count,
    );
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    for (const p of this.particleList) {
      const viewLocation = Renderer.transformWorld2View(p.location);
      // const color = mixColors(
      //   p.color,
      //   p.color.toTransparent(),
      //   this.timeProgress.rate,
      // );

      RenderUtils.renderPixel(viewLocation, p.color);
    }
  }
}
