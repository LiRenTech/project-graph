import { Color, mixColors } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { ShapeRenderer } from "../../render/canvas2d/shapeRenderer";
import { reverseAnimate } from "../animateFunctions";
import { easeOutQuint } from "../easings";
import { Effect } from "../effect";

/**
 * 用于提示某个矩形区域的效果
 *
 * 一个无比巨大的矩形（恰好是视野大小）突然缩小到目标矩形大小上。
 *
 * 这个效果可以用来提示某个矩形区域的存在，或者用来强调某个矩形区域的重要性。
 *
 * 目标矩形大小是世界坐标系
 */
export class RectangleNoteEffect extends Effect {
  constructor(
    public override timeProgress: ProgressNumber,
    public targetRectangle: Rectangle,
    public strokeColor: Color,
  ) {
    super(timeProgress);
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    const startRect = Renderer.getCoverWorldRectangle();
    const currentRect = new Rectangle(
      startRect.location.add(
        this.targetRectangle.location
          .subtract(startRect.location)
          .multiply(easeOutQuint(this.timeProgress.rate)),
      ),
      new Vector(
        startRect.size.x +
          (this.targetRectangle.size.x - startRect.size.x) *
            easeOutQuint(this.timeProgress.rate),
        startRect.size.y +
          (this.targetRectangle.size.y - startRect.size.y) *
            easeOutQuint(this.timeProgress.rate),
      ),
    );
    ShapeRenderer.renderRect(
      currentRect.transformWorld2View(),
      Color.Transparent,
      mixColors(
        Color.Transparent,
        this.strokeColor,
        reverseAnimate(this.timeProgress.rate),
      ),
      2,
      5,
    );
  }
}
