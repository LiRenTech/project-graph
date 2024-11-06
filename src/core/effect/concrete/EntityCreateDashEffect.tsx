import { Random } from "../../algorithm/random";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { easeOutCubic } from "../easings";
import { Effect } from "../effect";

/**
 * 实体创建时粉尘凝聚特效
 */
export class EntityCreateDashEffect extends Effect {
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

      this.speedArray.push(Random.randomFloat(1, 15));
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

  override tick() {
    super.tick();
    // 更新每个边上的当前粉尘位置
    for (let i = 0; i < EntityCreateDashEffect.DASH_NUMBER_PRE_EDGE; i++) {
      this.currentLocationArrayTop[i] = new Vector(
        this.initLocationArrayTop[i].x,
        Math.min(
          this.currentLocationArrayTop[i].y + this.speedArray[i],
          this.rectangle.top,
        ),
      );
      this.currentLocationArrayBottom[i] = new Vector(
        this.initLocationArrayBottom[i].x,
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
        this.initLocationArrayLeft[i].y,
      );
      this.currentLocationArrayRight[i] = new Vector(
        Math.max(
          this.currentLocationArrayRight[i].x - this.speedArray[i],
          this.rectangle.right,
        ),
        this.initLocationArrayRight[i].y,
      );
    }
  }

  static fromRectangle(
    rectangle: Rectangle,
    time = 30,
  ): EntityCreateDashEffect {
    return new EntityCreateDashEffect(new ProgressNumber(0, time), rectangle);
  }

  private rateNumber(a: number, b: number, rate: number): number {
    return a + (b - a) * rate;
  }
}
