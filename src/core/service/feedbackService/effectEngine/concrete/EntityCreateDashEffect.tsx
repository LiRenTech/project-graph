import { Random } from "../../../../algorithm/random";
import { mixColors } from "../../../../dataStruct/Color";
import { ProgressNumber } from "../../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Renderer } from "../../../../render/canvas2d/renderer";
import { RenderUtils } from "../../../../render/canvas2d/utilsRenderer/RenderUtils";
import { StageStyleManager } from "../../stageStyle/StageStyleManager";
import { EffectObject } from "../effectObject";
import { RateFunctions } from "../mathTools/rateFunctions";

/**
 * 实体创建时粉尘凝聚特效
 */
export class EntityCreateDashEffect extends EffectObject {
  static readonly DASH_NUMBER_PRE_EDGE = 250;

  private initLocationArrayTop: Vector[] = [];
  private initLocationArrayBottom: Vector[] = [];
  private initLocationArrayLeft: Vector[] = [];
  private initLocationArrayRight: Vector[] = [];
  private speedArray: number[] = [];

  public currentLocationArrayTop: Vector[] = [];
  public currentLocationArrayBottom: Vector[] = [];
  public currentLocationArrayLeft: Vector[] = [];
  public currentLocationArrayRight: Vector[] = [];

  constructor(
    /**
     * 一开始为0，每tick + 1
     */
    public override timeProgress: ProgressNumber,
    public rectangle: Rectangle,
  ) {
    super(timeProgress);
    const lambda = 4;
    const rate = 10;

    for (let i = 0; i < EntityCreateDashEffect.DASH_NUMBER_PRE_EDGE; i++) {
      this.initLocationArrayTop.push(
        new Vector(
          Random.randomFloat(rectangle.left, rectangle.right),
          rectangle.top,
        ).subtract(new Vector(0, Random.poissonRandom(lambda) * rate)),
      );
      this.initLocationArrayBottom.push(
        new Vector(
          Random.randomFloat(rectangle.left, rectangle.right),
          rectangle.bottom,
        ).add(new Vector(0, Random.poissonRandom(lambda) * rate)),
      );
      this.initLocationArrayLeft.push(
        new Vector(
          rectangle.left,
          Random.randomFloat(rectangle.top, rectangle.bottom),
        ).subtract(new Vector(Random.poissonRandom(lambda) * rate, 0)),
      );
      this.initLocationArrayRight.push(
        new Vector(
          rectangle.right,
          Random.randomFloat(rectangle.top, rectangle.bottom),
        ).add(new Vector(Random.poissonRandom(lambda) * rate, 0)),
      );

      this.speedArray.push(Random.randomFloat(1, 5));
    }

    this.currentLocationArrayTop = this.initLocationArrayTop.map((v) =>
      v.clone(),
    );
    this.currentLocationArrayBottom = this.initLocationArrayBottom.map((v) =>
      v.clone(),
    );
    this.currentLocationArrayLeft = this.initLocationArrayLeft.map((v) =>
      v.clone(),
    );
    this.currentLocationArrayRight = this.initLocationArrayRight.map((v) =>
      v.clone(),
    );
  }
  private getShakeRandom() {
    return Random.randomFloat(-1, 1) * 3;
  }

  override tick() {
    super.tick();
    // 更新每个边上的当前粉尘位置
    for (let i = 0; i < EntityCreateDashEffect.DASH_NUMBER_PRE_EDGE; i++) {
      this.currentLocationArrayTop[i] = new Vector(
        this.currentLocationArrayTop[i].x + this.getShakeRandom(),
        Math.min(
          this.currentLocationArrayTop[i].y + this.speedArray[i],
          this.rectangle.top,
        ),
      );
      this.currentLocationArrayBottom[i] = new Vector(
        this.currentLocationArrayBottom[i].x + this.getShakeRandom(),
        Math.max(
          this.currentLocationArrayBottom[i].y - this.speedArray[i],
          this.rectangle.bottom,
        ),
      );
      this.currentLocationArrayLeft[i] = new Vector(
        Math.min(
          this.currentLocationArrayLeft[i].x + this.speedArray[i],
          this.rectangle.left,
        ),
        this.currentLocationArrayLeft[i].y + this.getShakeRandom(),
      );
      this.currentLocationArrayRight[i] = new Vector(
        Math.max(
          this.currentLocationArrayRight[i].x - this.speedArray[i],
          this.rectangle.right,
        ),
        this.currentLocationArrayRight[i].y + this.getShakeRandom(),
      );
    }
  }

  static fromRectangle(
    rectangle: Rectangle,
    time = 30,
  ): EntityCreateDashEffect {
    return new EntityCreateDashEffect(new ProgressNumber(0, time), rectangle);
  }

  render(): void {
    if (this.timeProgress.isFull) {
      return;
    }
    for (const p of this.currentLocationArrayTop) {
      const viewLocation = Renderer.transformWorld2View(p);
      const color = mixColors(
        StageStyleManager.currentStyle.StageObjectBorderColor.toTransparent(),
        StageStyleManager.currentStyle.StageObjectBorderColor,
        RateFunctions.doorFunction(this.timeProgress.rate),
      );

      RenderUtils.renderPixel(viewLocation, color);
    }
    for (const p of this.currentLocationArrayBottom) {
      const viewLocation = Renderer.transformWorld2View(p);
      const color = mixColors(
        StageStyleManager.currentStyle.StageObjectBorderColor.toTransparent(),
        StageStyleManager.currentStyle.StageObjectBorderColor,
        RateFunctions.doorFunction(this.timeProgress.rate),
      );

      RenderUtils.renderPixel(viewLocation, color);
    }

    for (const p of this.currentLocationArrayLeft) {
      const viewLocation = Renderer.transformWorld2View(p);
      const color = mixColors(
        StageStyleManager.currentStyle.StageObjectBorderColor.toTransparent(),
        StageStyleManager.currentStyle.StageObjectBorderColor,
        RateFunctions.doorFunction(this.timeProgress.rate),
      );

      RenderUtils.renderPixel(viewLocation, color);
    }

    for (const p of this.currentLocationArrayRight) {
      const viewLocation = Renderer.transformWorld2View(p);
      const color = mixColors(
        StageStyleManager.currentStyle.StageObjectBorderColor.toTransparent(),
        StageStyleManager.currentStyle.StageObjectBorderColor,
        RateFunctions.doorFunction(this.timeProgress.rate),
      );

      RenderUtils.renderPixel(viewLocation, color);
    }
  }
}
