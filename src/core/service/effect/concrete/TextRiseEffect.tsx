import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Canvas } from "../../../stage/Canvas";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { easeInOutSine } from "../easings";
import { Effect } from "../effect";

/**
 * 文字上浮特效
 */
export class TextRiseEffect extends Effect {
  constructor(
    public text: string,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 100),
  ) {
    super(timeProgress);
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    // 在画布中心缓缓升高一段距离
    const centerLocation = new Vector(Renderer.w / 2, Renderer.h / 2);
    const distance = 100;

    Canvas.ctx.font = `20px Arial`;
    Canvas.ctx.fillStyle =
      StageStyleManager.currentStyle.effects.flash.toString();
    Canvas.ctx.textAlign = "center";
    Canvas.ctx.textBaseline = "middle";
    Canvas.ctx.globalAlpha = 1 - easeInOutSine(this.timeProgress.rate);
    Canvas.ctx.fillText(
      this.text,
      centerLocation.x,
      centerLocation.y - distance * easeInOutSine(this.timeProgress.rate),
    );
    Canvas.ctx.globalAlpha = 1;
  }
}
