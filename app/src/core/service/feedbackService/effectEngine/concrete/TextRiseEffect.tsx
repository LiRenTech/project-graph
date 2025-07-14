import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { TextRenderer } from "../../../../render/canvas2d/basicRenderer/textRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Canvas } from "../../../../stage/Canvas";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";
import { easeInOutSine } from "../mathTools/easings";

/**
 * 文字上浮特效
 */
export class TextRiseEffect extends EffectObject {
  getClassName(): string {
    return "TextRiseEffect";
  }

  constructor(
    public text: string,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 100),
  ) {
    super(timeProgress);
  }

  static default(text: string): TextRiseEffect {
    return new TextRiseEffect(text, new ProgressNumber(0, 100));
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    // 在画布中心缓缓升高一段距离
    const distance = 100;
    const renderCenterLocation = new Vector(
      Renderer.w / 2,
      Renderer.h / 2 - distance * easeInOutSine(this.timeProgress.rate),
    );
    TextRenderer.renderMultiLineTextFromCenter(
      this.text,
      renderCenterLocation,
      20,
      Infinity,
      StageStyleManager.currentStyle.StageObjectBorder,
    );
    Canvas.ctx.globalAlpha = 1;
  }
}
