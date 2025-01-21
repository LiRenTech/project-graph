import { Random } from "../../../algorithm/random";
import { Color, mixColors } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { ShapeRenderer } from "../../../render/canvas2d/basicRenderer/shapeRenderer";
import { Camera } from "../../../stage/Camera";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { Effect } from "../effect";

/**
 * 用于逻辑节点执行了一次效果
 * 附着在矩形上，从中心向外扩散
 */
export class RectangleLittleNoteEffect extends Effect {
  private currentRect: Rectangle;

  constructor(
    public override timeProgress: ProgressNumber,
    public targetRectangle: Rectangle,
    public strokeColor: Color,
  ) {
    super(timeProgress);
    this.currentRect = targetRectangle.clone();
  }

  static fromUtilsLittleNote(textNode: TextNode): RectangleLittleNoteEffect {
    return new RectangleLittleNoteEffect(
      new ProgressNumber(0, 15),
      textNode.collisionBox.getRectangle(),
      Color.Green,
    );
  }

  override tick(): void {
    super.tick();
    this.currentRect = this.currentRect.expandFromCenter(
      Random.randomFloat(1, 2),
    );
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    ShapeRenderer.renderRect(
      this.currentRect.transformWorld2View(),
      Color.Transparent,
      mixColors(
        Color.Transparent,
        this.strokeColor,
        1 - this.timeProgress.rate,
      ),
      2 * Camera.currentScale,
      8 * Camera.currentScale,
    );
  }
}
