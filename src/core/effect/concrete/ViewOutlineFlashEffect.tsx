import { Color, mixColors } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { ShapeRenderer } from "../../render/canvas2d/basicRenderer/shapeRenderer";
import { Renderer } from "../../render/canvas2d/renderer";
import { Effect } from "../effect";

/**
 * 屏幕边缘闪颜色效果
 */
export class ViewOutlineFlashEffect extends Effect {
  constructor(
    public color: Color,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 100),
  ) {
    super(timeProgress);
  }

  static normal(color: Color): ViewOutlineFlashEffect {
    return new ViewOutlineFlashEffect(color);
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    const viewRect = Renderer.getCoverWorldRectangle();

    const currentColor = mixColors(
      this.color,
      new Color(0, 0, 0, 0),
      this.timeProgress.rate,
    );
    // 左侧边缘

    ShapeRenderer.renderRectWithShadow(
      new Rectangle(
        viewRect.leftTop,
        new Vector(20, viewRect.size.y),
      ).transformWorld2View(),
      currentColor,
      Color.Transparent,
      0,
      currentColor,
      200,
    );
    // 右侧边缘
    ShapeRenderer.renderRectWithShadow(
      new Rectangle(
        new Vector(viewRect.left + viewRect.size.x - 20, viewRect.top),
        new Vector(20, viewRect.size.y),
      ).transformWorld2View(),
      currentColor,
      Color.Transparent,
      0,
      currentColor,
      50,
    );
    // 上侧边缘
    ShapeRenderer.renderRectWithShadow(
      new Rectangle(
        viewRect.leftTop,
        new Vector(viewRect.size.x, 20),
      ).transformWorld2View(),
      currentColor,
      Color.Transparent,
      0,
      currentColor,
      50,
    );
    // 下侧边缘
    ShapeRenderer.renderRectWithShadow(
      new Rectangle(
        new Vector(viewRect.left, viewRect.top + viewRect.size.y - 20),
        new Vector(viewRect.size.x, 20),
      ).transformWorld2View(),
      currentColor,
      Color.Transparent,
      0,
      currentColor,
      50,
    );
  }
}
