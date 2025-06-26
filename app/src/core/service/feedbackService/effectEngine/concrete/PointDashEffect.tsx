import { Color, mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectParticle } from "../effectElements/effectParticle";
import { EffectObject } from "../effectObject";

/**
 * 在一个点迸发一些粒子效果
 */
export class PointDashEffect extends EffectObject {
  getClassName(): string {
    return "PointDashEffect";
  }
  public particleList: EffectParticle[] = [];

  constructor(
    private readonly project: Project,
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
          StageStyleManager.currentStyle.StageObjectBorder,
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

      for (const connectEntity of this.project.stageManager.getConnectableEntity()) {
        const connectEntityCenter = connectEntity.collisionBox.getRectangle().center;
        const distance = connectEntityCenter.subtract(particle.location);
        const normalizedDistance = distance.normalize().multiply(20 / distance.magnitude() ** 1.2);
        acceleration = acceleration.add(normalizedDistance);

        if (connectEntity.collisionBox.isContainsPoint(particle.location)) {
          // 粒子碰到实体
          isCollideWithEntity = true;
        }
      }
      if (isCollideWithEntity) {
        particle.color = Color.Green;
      } else {
        particle.color = mixColors(
          StageStyleManager.currentStyle.StageObjectBorder,
          StageStyleManager.currentStyle.StageObjectBorder.toTransparent(),
          this.timeProgress.rate,
        );
      }
      particle.acceleration = acceleration;

      particle.tick();
    }
  }

  static fromMouseEffect(project: Project, mouseWorldLocation: Vector, count: number): PointDashEffect {
    return new PointDashEffect(project, new ProgressNumber(0, 50), mouseWorldLocation, count);
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    for (const p of this.particleList) {
      const viewLocation = this.project.renderer.transformWorld2View(p.location);
      // const color = mixColors(
      //   p.color,
      //   p.color.toTransparent(),
      //   this.timeProgress.rate,
      // );

      this.project.renderUtils.renderPixel(viewLocation, p.color);
    }
  }
}
