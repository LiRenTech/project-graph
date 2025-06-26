import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { Project } from "../../../../Project";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { Effect } from "../effectObject";

/**
 * 在特定的世界坐标系下渲染一个文字
 * 用途之一：给逻辑引擎渲染编号
 */
export class TextRaiseEffectLocated extends Effect {
  getClassName(): string {
    return "TextRaiseEffectLocated";
  }
  constructor(
    public text: string,
    public location: Vector,
    public raiseDistance: number,
    public textSize: number = 16,
    public override timeProgress: ProgressNumber = new ProgressNumber(0, 100),
  ) {
    super(timeProgress);
  }

  render(project: Project) {
    if (this.timeProgress.isFull) {
      return;
    }
    project.textRenderer.renderTextFromCenter(
      this.text,
      project.renderer.transformWorld2View(
        this.location.add(new Vector(0, -this.timeProgress.rate * this.raiseDistance)),
      ),
      this.textSize * project.camera.currentScale,
      StageStyleManager.currentStyle.CollideBoxPreSelected,
    );
  }

  static fromDebugLogicNode(n: number, location: Vector): TextRaiseEffectLocated {
    return new TextRaiseEffectLocated(project, `${n}`, location, 0, 150, new ProgressNumber(0, 3));
  }
}
