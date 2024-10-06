import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Vector } from "../../dataStruct/Vector";
import { Effect } from "../effect";

/**
 * 线段特效
 * 直接显示全部，随着时间推移逐渐透明
 */
export class LineEffect extends Effect {
  constructor(
    public override timeProgress: ProgressNumber,
    public fromLocation: Vector,
    public toLocation: Vector,
    public fromColor: Color,
    public toColor: Color,
    public lineWidth: number,
  ) {
    super(timeProgress);
  }
}
