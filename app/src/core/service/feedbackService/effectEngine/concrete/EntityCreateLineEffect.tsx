import { Random } from "../../../../algorithm/random";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";
import { TechLineEffect } from "./TechLineEffect";

export class EntityCreateLineEffect extends EffectObject {
  getClassName(): string {
    return "EntityCreateLineEffect";
  }
  constructor(
    public override timeProgress: ProgressNumber,
    public rect: Rectangle,
  ) {
    super(timeProgress);
    // 子特效
    this.subEffects = [];
    const initLen = 20;
    const segmentCount = 50;
    const preChange = -1;
    // const effectColor = StageStyleManager.currentStyle.CollideBoxSelectedColor;
    const effectColor = StageStyleManager.currentStyle.StageObjectBorder;
    const rotateDegrees = 90;
    // 顶部线
    for (let i = 0; i < 5; i++) {
      const topStartLocation = new Vector(Random.randomFloat(this.rect.left, this.rect.right), this.rect.top);
      const topEndLocation = topStartLocation.add(new Vector(0, -1000));
      const zapLineEffect = new TechLineEffect(
        topStartLocation,
        topEndLocation,
        segmentCount,
        initLen,
        preChange,
        rotateDegrees,
        effectColor,
        this.timeProgress.clone(),
        2,
      );
      this.subEffects.push(zapLineEffect);
    }
    // 底部线
    for (let i = 0; i < 5; i++) {
      const bottomStartLocation = new Vector(Random.randomFloat(this.rect.left, this.rect.right), this.rect.bottom);
      const bottomEndLocation = bottomStartLocation.add(new Vector(0, 1000));
      const zapLineEffect = new TechLineEffect(
        bottomStartLocation,
        bottomEndLocation,
        segmentCount,
        initLen,
        preChange,
        rotateDegrees,
        effectColor,
        this.timeProgress.clone(),
        2,
      );
      this.subEffects.push(zapLineEffect);
    }
    // 左侧线
    for (let i = 0; i < 5; i++) {
      const leftStartLocation = new Vector(this.rect.left, Random.randomFloat(this.rect.top, this.rect.bottom));
      const leftEndLocation = leftStartLocation.add(new Vector(-1000, 0));
      const zapLineEffect = new TechLineEffect(
        leftStartLocation,
        leftEndLocation,
        segmentCount,
        initLen,
        preChange,
        rotateDegrees,
        effectColor,
        this.timeProgress.clone(),
        2,
      );
      this.subEffects.push(zapLineEffect);
    }
    // 右侧线
    for (let i = 0; i < 5; i++) {
      const rightStartLocation = new Vector(this.rect.right, Random.randomFloat(this.rect.top, this.rect.bottom));
      const rightEndLocation = rightStartLocation.add(new Vector(1000, 0));
      const zapLineEffect = new TechLineEffect(
        rightStartLocation,
        rightEndLocation,
        segmentCount,
        initLen,
        preChange,
        rotateDegrees,
        effectColor,
        this.timeProgress.clone(),
        2,
      );
      this.subEffects.push(zapLineEffect);
    }
  }

  static from(rectangle: Rectangle): EntityCreateLineEffect {
    return new EntityCreateLineEffect(new ProgressNumber(0, 30), rectangle);
  }

  override tick() {
    super.tick();
  }

  render(): void {
    for (const subEffect of this.subEffects) {
      subEffect.render();
    }
  }
}
