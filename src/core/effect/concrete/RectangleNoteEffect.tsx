import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
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
}
