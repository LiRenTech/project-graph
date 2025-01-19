import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Vector } from "../../dataStruct/Vector";
import { Renderer } from "../../render/canvas2d/renderer";
import { RenderUtils } from "../../render/canvas2d/RenderUtils";
import { Camera } from "../../stage/Camera";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { Effect } from "../effect";

export class TextRaiseEffectLocated extends Effect {
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
    RenderUtils.renderTextFromCenter(
      this.text,
      Renderer.transformWorld2View(
        this.location.add(
          new Vector(0, -this.timeProgress.rate * this.raiseDistance),
        ),
      ),
      this.textSize * Camera.currentScale,
      StageStyleManager.currentStyle.CollideBoxPreSelectedColor,
    );
  }

  static fromDebugLogicNode(
    n: number,
    location: Vector,
  ): TextRaiseEffectLocated {
    return new TextRaiseEffectLocated(
      `${n}`,
      location,
      0,
      150,
      new ProgressNumber(0, 3),
    );
  }
}