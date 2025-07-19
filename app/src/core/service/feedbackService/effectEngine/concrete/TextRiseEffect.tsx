import { ProgressNumber, Vector } from "@graphif/data-structures";
import { Project } from "../../../../Project";
import { Effect } from "../effectObject";
import { easeInOutSine } from "../mathTools/easings";

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

  static default(text: string): TextRiseEffect {
    return new TextRiseEffect(text, new ProgressNumber(0, 100));
  }

  render(project: Project) {
    if (this.timeProgress.isFull) {
      return;
    }
    // 在画布中心缓缓升高一段距离
    const distance = 100;
    const renderCenterLocation = new Vector(
      project.renderer.w / 2,
      project.renderer.h / 2 - distance * easeInOutSine(this.timeProgress.rate),
    );
    project.textRenderer.renderMultiLineTextFromCenter(
      this.text,
      renderCenterLocation,
      20,
      Infinity,
      this.project.stageStyleManager.currentStyle.StageObjectBorder,
    );
    project.canvas.ctx.globalAlpha = 1;
  }
}
