import { ProgressNumber, Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import { Random } from "@/core/algorithm/random";
import { Project } from "@/core/Project";
import { Effect } from "@/core/service/feedbackService/effectEngine/effectObject";
import { TechLineEffect } from "@/core/service/feedbackService/effectEngine/concrete/TechLineEffect";

export class EntityCreateLineEffect extends Effect {
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
    // const effectColor = this.project.stageStyleManager.currentStyle.CollideBoxSelectedColor;
    const effectColor = this.project.stageStyleManager.currentStyle.StageObjectBorder;
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

  render(project: Project) {
    for (const subEffect of this.subEffects) {
      subEffect.render(project);
    }
  }
}
