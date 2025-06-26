import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
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
    private readonly project: Project,
    public text: string,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 100),
  ) {
    super(timeProgress);
  }

  static default(project: Project, text: string): TextRiseEffect {
    return new TextRiseEffect(project, text, new ProgressNumber(0, 100));
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    // 在画布中心缓缓升高一段距离
    const distance = 100;
    const renderCenterLocation = new Vector(
      this.project.renderer.w / 2,
      this.project.renderer.h / 2 - distance * easeInOutSine(this.timeProgress.rate),
    );
    this.project.textRenderer.renderMultiLineTextFromCenter(
      this.text,
      renderCenterLocation,
      20,
      Infinity,
      StageStyleManager.currentStyle.StageObjectBorder,
    );
    this.project.canvas.ctx.globalAlpha = 1;
  }
}
