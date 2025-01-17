import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Line } from "../../dataStruct/shape/Line";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { RenderUtils } from "../../render/canvas2d/RenderUtils";
import { Camera } from "../../stage/Camera";
import { Effect } from "../effect";

/**
 * 实体对齐特效
 */
export class EntityAlignEffect extends Effect {
  private lines: Line[] = [];
  static fromEntity(
    moveRectangle: Rectangle,
    targetRectangle: Rectangle,
  ): EntityAlignEffect {
    return new EntityAlignEffect(
      new ProgressNumber(0, 10),
      moveRectangle,
      targetRectangle,
    );
  }
  constructor(
    public override timeProgress: ProgressNumber,
    moveRectangle: Rectangle,
    targetRectangle: Rectangle,
  ) {
    super(timeProgress);
    const moveEntityRectangle = moveRectangle;
    const targetEntityRectangle = targetRectangle;

    // 两个矩形构成的最小外接矩形
    const twoRectangle = Rectangle.getBoundingRectangle([
      moveEntityRectangle,
      targetEntityRectangle,
    ]);
    // 计算两个矩形现在是哪里对齐了，是左边缘x轴对齐，还是右边缘x轴对齐，
    // 还是上边缘y轴对齐，还是下边缘y轴对齐
    // 左边缘x对齐检测
    if (moveEntityRectangle.left === targetEntityRectangle.left) {
      // 左边缘x轴对齐，添加一个左边缘线
      this.lines.push(
        new Line(
          new Vector(moveEntityRectangle.left, twoRectangle.top),
          new Vector(moveEntityRectangle.left, twoRectangle.bottom),
        ),
      );
    }
    // 右边缘x轴对齐检测
    if (moveEntityRectangle.right === targetEntityRectangle.right) {
      // 右边缘x轴对齐，添加一个右边缘线
      this.lines.push(
        new Line(
          new Vector(moveEntityRectangle.right, twoRectangle.top),
          new Vector(moveEntityRectangle.right, twoRectangle.bottom),
        ),
      );
    }
    // 上边缘y轴对齐检测
    if (moveEntityRectangle.top === targetEntityRectangle.top) {
      // 上边缘y轴对齐，添加一个上边缘线
      this.lines.push(
        new Line(
          new Vector(twoRectangle.left, moveEntityRectangle.top),
          new Vector(twoRectangle.right, moveEntityRectangle.top),
        ),
      );
    }
    // 下边缘y轴对齐检测
    if (moveEntityRectangle.bottom === targetEntityRectangle.bottom) {
      // 下边缘y轴对齐，添加一个下边缘线
      this.lines.push(
        new Line(
          new Vector(twoRectangle.left, moveEntityRectangle.bottom),
          new Vector(twoRectangle.right, moveEntityRectangle.bottom),
        ),
      );
    }
  }

  render(): void {
    for (const line of this.lines) {
      RenderUtils.renderSolidLine(
        Renderer.transformWorld2View(line.start),
        Renderer.transformWorld2View(line.end),
        new Color(0, 255, 0, 1 - this.timeProgress.rate),
        2 * Camera.currentScale,
      );
    }
  }
}
