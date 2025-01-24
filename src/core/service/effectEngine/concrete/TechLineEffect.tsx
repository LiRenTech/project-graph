import { Random } from "../../../algorithm/random";
import { Color, mixColors } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Vector } from "../../../dataStruct/Vector";
import { CurveRenderer } from "../../../render/canvas2d/basicRenderer/curveRenderer";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { EffectObject } from "../effectObject";

/**
 * 一条富有科技感的连线特效
 * 从start点开始，朝着end点前进，
 * 经过segmentCount短折线，每段折线的长度为initLen，每次偏转角度为-rotateDegrees | 0 | rotateDegrees 之间随机
 * 最终不一定到达end点，因为有随机偏移
 */
export class TechLineEffect extends EffectObject {
  constructor(
    start: Vector,
    private end: Vector,
    private segmentCount: number,
    private initLen: number,
    private lenPreChange: number,
    private maxRotateDegrees: number,
    private color: Color,
    public timeProgress: ProgressNumber,
    private lineWidth = 10,
  ) {
    super(timeProgress);
    this.end = end;
    this.segmentCount = segmentCount;
    this.initLen = initLen;
    this.lenPreChange = lenPreChange;
    this.maxRotateDegrees = maxRotateDegrees;
    this.currentPoints.push(start);
  }

  /**
   * 记录所有走过的折线点
   */
  private currentPoints: Vector[] = [];

  private currentLen = this.initLen;

  tick(): void {
    super.tick();
    if (this.currentPoints.length < this.segmentCount + 1) {
      // 开始增加点
      const lastPoint = this.currentPoints[this.currentPoints.length - 1];
      const direction = Vector.fromTwoPoints(lastPoint, this.end).normalize();
      const randomDegrees = Random.randomItem([
        -this.maxRotateDegrees,
        0,
        this.maxRotateDegrees,
      ]);
      const newLocation = lastPoint.add(
        direction.rotateDegrees(randomDegrees).multiply(this.currentLen),
      );
      this.currentPoints.push(newLocation);
      // 更新长度
      this.currentLen += this.lenPreChange;
    }
  }

  static normal(
    startLocation: Vector,
    endLocation: Vector,
    color: Color,
  ): TechLineEffect {
    return new TechLineEffect(
      startLocation,
      endLocation,
      10,
      100,
      -5,
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
