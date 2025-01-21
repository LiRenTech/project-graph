import { Random } from "../../../algorithm/random";
import { Color, mixColors } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Vector } from "../../../dataStruct/Vector";
import { CurveRenderer } from "../../../render/canvas2d/basicRenderer/curveRenderer";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { EffectObject } from "../effectObject";

/**
 * 一条闪电线特效
 * 从start点开始，朝着end点前进，
 * 经过n短折线，每段折线的长度为l，每次偏转角度为-maxRotateDegrees~maxRotateDegrees之间随机
 * 最终不一定到达end点，因为有随机偏移
 */
export class ZapLineEffect extends EffectObject {
  constructor(
    start: Vector,
    private end: Vector,
    private n: number,
    private l: number,
    private maxRotateDegrees: number,
    private color: Color,
    public timeProgress: ProgressNumber,
    private lineWidth = 10,
  ) {
    super(timeProgress);
    this.end = end;
    this.n = n;
    this.l = l;
    this.maxRotateDegrees = maxRotateDegrees;
    this.currentPoints.push(start);
  }

  private currentPoints: Vector[] = [];

  tick(): void {
    super.tick();
    if (this.currentPoints.length < this.n + 1) {
      // 开始增加点
      const lastPoint = this.currentPoints[this.currentPoints.length - 1];
      const direction = Vector.fromTwoPoints(lastPoint, this.end).normalize();
      const randomDegrees = Random.randomFloat(
        -this.maxRotateDegrees,
        this.maxRotateDegrees,
      );
      const newLocation = lastPoint.add(
        direction.rotateDegrees(randomDegrees).multiply(this.l),
      );
      this.currentPoints.push(newLocation);
    }
  }

  static normal(
    startLocation: Vector,
    endLocation: Vector,
    color: Color,
  ): ZapLineEffect {
    return new ZapLineEffect(
      startLocation,
      endLocation,
      10,
      100,
      15,
      color,
      new ProgressNumber(0, 50),
    );
  }

  render(): void {
    const currentColor = mixColors(
      this.color,
      Color.Transparent,
      this.timeProgress.rate,
    );
    const viewLocations = this.currentPoints.map((p) =>
      Renderer.transformWorld2View(p),
    );
    CurveRenderer.renderSolidLineMultipleWithShadow(
      viewLocations,
      currentColor,
      (1 - this.timeProgress.rate) * this.lineWidth * Camera.currentScale,
      this.color,
      10,
    );
  }
}
