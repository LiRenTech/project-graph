import { Random } from "../../../../algorithm/random";
import { Color, mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Project } from "../../../../Project";
import { TextNode } from "../../../../stage/stageObject/entity/TextNode";
import { EffectObject } from "../effectObject";

/**
 * 用于逻辑节点执行了一次效果
 * 附着在矩形上，从中心向外扩散
 */
export class RectangleLittleNoteEffect extends EffectObject {
  getClassName(): string {
    return "RectangleLittleNoteEffect";
  }
  private currentRect: Rectangle;

  constructor(
    private readonly project: Project,
    public override timeProgress: ProgressNumber,
    public targetRectangle: Rectangle,
    public strokeColor: Color,
  ) {
    super(timeProgress);
    this.currentRect = targetRectangle.clone();
  }

  static fromUtilsLittleNote(project: Project, textNode: TextNode): RectangleLittleNoteEffect {
    return new RectangleLittleNoteEffect(
      project,
      new ProgressNumber(0, 15),
      textNode.collisionBox.getRectangle(),
      Color.Green,
    );
  }

  override tick(): void {
    super.tick();
    this.currentRect = this.currentRect.expandFromCenter(Random.randomFloat(1, 2));
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    this.project.shapeRenderer.renderRect(
      this.project.renderer.transformWorld2View(this.currentRect),
      Color.Transparent,
      mixColors(Color.Transparent, this.strokeColor, 1 - this.timeProgress.rate),
      2 * this.project.camera.currentScale,
      8 * this.project.camera.currentScale,
    );
  }
}
