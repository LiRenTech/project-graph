import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Project } from "../../../../Project";
import { EffectObject } from "../effectObject";
import { LineCuttingEffect } from "./LineCuttingEffect";

/**
 * 用于某个节点进入了某个Section内部，四个角连向了父Section矩形的四个角
 */
export class RectanglePushInEffect extends EffectObject {
  getClassName(): string {
    return "RectanglePushInEffect";
  }
  constructor(
    private readonly project: Project,
    public smallRectangle: Rectangle,
    public bigRectangle: Rectangle,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 50),
    private reversed = false,
  ) {
    super(timeProgress);
    if (this.reversed) {
      this.subEffects = [
        new LineCuttingEffect(
          project,
          timeProgress,
          bigRectangle.leftTop,
          smallRectangle.leftTop,
          Color.Red,
          Color.Red,
        ),
        new LineCuttingEffect(
          project,
          timeProgress,
          bigRectangle.rightTop,
          smallRectangle.rightTop,
          Color.Red,
          Color.Red,
        ),
        new LineCuttingEffect(
          project,
          timeProgress,
          bigRectangle.leftBottom,
          smallRectangle.leftBottom,
          Color.Red,
          Color.Red,
        ),
        new LineCuttingEffect(
          project,
          timeProgress,
          bigRectangle.rightBottom,
          smallRectangle.rightBottom,
          Color.Red,
          Color.Red,
        ),
      ];
    } else {
      this.subEffects = [
        new LineCuttingEffect(
          project,
          timeProgress,
          smallRectangle.leftTop,
          bigRectangle.leftTop,
          Color.Green,
          Color.Green,
        ),
        new LineCuttingEffect(
          project,
          timeProgress,
          smallRectangle.rightTop,
          bigRectangle.rightTop,
          Color.Green,
          Color.Green,
        ),
        new LineCuttingEffect(
          project,
          timeProgress,
          smallRectangle.leftBottom,
          bigRectangle.leftBottom,
          Color.Green,
          Color.Green,
        ),
        new LineCuttingEffect(
          project,
          timeProgress,
          smallRectangle.rightBottom,
          bigRectangle.rightBottom,
          Color.Green,
          Color.Green,
        ),
      ];
    }
  }

  static sectionGoInGoOut(project: Project, entityRectangle: Rectangle, sectionRectangle: Rectangle, isGoOut = false) {
    const timeProgress = new ProgressNumber(0, 50);
    return new RectanglePushInEffect(project, entityRectangle, sectionRectangle, timeProgress, isGoOut);
  }

  protected subEffects: EffectObject[];

  render(): void {
    for (const effect of this.subEffects) {
      effect.render();
    }
  }
}
