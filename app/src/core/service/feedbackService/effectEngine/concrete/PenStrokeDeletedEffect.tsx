import { Color } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Vector } from "../../../../dataStruct/Vector";
import { CurveRenderer } from "../../../../render/canvas2d/basicRenderer/curveRenderer";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { Camera } from "../../../../stage/Camera";
import { PenStroke } from "../../../../stage/stageObject/entity/PenStroke";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";

export class PenStrokeDeletedEffect extends EffectObject {
  getClassName(): string {
    return "PenStrokeDeletedEffect";
  }
  private pathList: Vector[] = [];
  private currentPartList: Vector[] = [];
  private color: Color = new Color(0, 0, 0);
  private width: number = 1;

  constructor(
    public override timeProgress: ProgressNumber,
    penStroke: PenStroke,
  ) {
    super(timeProgress);
    const segmentList = penStroke.getSegmentList();
    this.pathList = penStroke.getPath();
    this.color = penStroke.getColor();
    if (this.color.a === 0) {
      this.color = StageStyleManager.currentStyle.StageObjectBorder.clone();
    }
    this.width = segmentList[0].width;
  }

  static fromPenStroke(penStroke: PenStroke): PenStrokeDeletedEffect {
    const len = penStroke.getPath().length;
    return new PenStrokeDeletedEffect(new ProgressNumber(0, len), penStroke);
  }

  tick(): void {
    super.tick();
    const currentSep = Math.floor(this.pathList.length * this.timeProgress.rate);
    this.currentPartList = [];
    for (let i = currentSep; i < this.pathList.length; i++) {
      this.currentPartList.push(this.pathList[i]);
    }
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    if (this.currentPartList.length === 0) {
      return;
    }

    CurveRenderer.renderSolidLineMultiple(
      this.currentPartList.map((v) => Renderer.transformWorld2View(v)),
      this.color.toNewAlpha(1 - this.timeProgress.rate),
      this.width * Camera.currentScale,
    );
  }
}
