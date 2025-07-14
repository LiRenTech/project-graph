import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { TextRenderer } from "../../../../render/canvas2d/basicRenderer/textRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";

/**
 * 在特定的世界坐标系下渲染一个文字
 * 用途之一：给逻辑引擎渲染编号
 */
export class TextRaiseEffectLocated extends EffectObject {
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

  render() {
    if (this.timeProgress.isFull) {
      return;
    }
    TextRenderer.renderTextFromCenter(
      this.text,
      Renderer.transformWorld2View(this.location.add(new Vector(0, -this.timeProgress.rate * this.raiseDistance))),
      this.textSize * Camera.currentScale,
      StageStyleManager.currentStyle.CollideBoxPreSelected,
    );
  }

  static fromDebugLogicNode(n: number, location: Vector): TextRaiseEffectLocated {
    return new TextRaiseEffectLocated(`${n}`, location, 0, 150, new ProgressNumber(0, 3));
  }
}
