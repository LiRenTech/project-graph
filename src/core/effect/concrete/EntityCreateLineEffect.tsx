import { Random } from "../../algorithm/random";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { Effect } from "../effect";
import { ZapLineEffect } from "./ZapLineEffect";

export class EntityCreateLineEffect extends Effect {
  constructor(
    public override timeProgress: ProgressNumber,
    public rect: Rectangle,
  ) {
    super(timeProgress);
    // 子特效
    this.subEffects = [];
    // 顶部线
    for (let i = 0; i < 10; i++) {
      const topStartLocation = new Vector(
        Random.randomFloat(this.rect.left, this.rect.right),
        this.rect.top,
      );
      const topEndLocation = topStartLocation.add(
        topStartLocation.subtract(this.rect.center).multiply(100),
      );
      const zapLineEffect = new ZapLineEffect(
        topStartLocation,
        topEndLocation,
        50,
        20,
        45,
        StageStyleManager.currentStyle.StageObjectBorderColor,
        this.timeProgress.clone(),
        2,
      );
      this.subEffects.push(zapLineEffect);
    }
    // 底部线
    for (let i = 0; i < 10; i++) {
      const bottomStartLocation = new Vector(
        Random.randomFloat(this.rect.left, this.rect.right),
        this.rect.bottom,
      );
      const bottomEndLocation = bottomStartLocation.add(
        bottomStartLocation.subtract(this.rect.center).multiply(100),
      );
      const zapLineEffect = new ZapLineEffect(
        bottomStartLocation,
        bottomEndLocation,
        50,
        20,
        45,
        StageStyleManager.currentStyle.StageObjectBorderColor,
        this.timeProgress.clone(),
        2,
      );
      this.subEffects.push(zapLineEffect);
    }
    // 左侧线
    for (let i = 0; i < 10; i++) {
      const leftStartLocation = new Vector(
        this.rect.left,
        Random.randomFloat(this.rect.top, this.rect.bottom),
      );
      const leftEndLocation = leftStartLocation.add(
        leftStartLocation.subtract(this.rect.center).multiply(100),
      );
      const zapLineEffect = new ZapLineEffect(
        leftStartLocation,
        leftEndLocation,
        50,
        20,
        45,
        StageStyleManager.currentStyle.StageObjectBorderColor,
        this.timeProgress.clone(),
        2,
      );
      this.subEffects.push(zapLineEffect);
    }
    // 右侧线
    for (let i = 0; i < 10; i++) {
      const rightStartLocation = new Vector(
        this.rect.right,
        Random.randomFloat(this.rect.top, this.rect.bottom),
      );
      const rightEndLocation = rightStartLocation.add(
        rightStartLocation.subtract(this.rect.center).multiply(100),
      );
      const zapLineEffect = new ZapLineEffect(
        rightStartLocation,
        rightEndLocation,
        50,
        20,
        45,
        StageStyleManager.currentStyle.StageObjectBorderColor,
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
