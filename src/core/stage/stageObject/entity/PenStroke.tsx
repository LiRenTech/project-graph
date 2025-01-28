import { v4 } from "uuid";
import { Color } from "../../../dataStruct/Color";
import { Line } from "../../../dataStruct/shape/Line";
import { Vector } from "../../../dataStruct/Vector";
import { StageStyleManager } from "../../../service/feedbackService/stageStyle/StageStyleManager";
import { Entity } from "../abstract/StageEntity";
import { CollisionBox } from "../collisionBox/collisionBox";

/**
 * 一笔画中的某一个小段
 */
class PenStrokeSegment {
  constructor(
    public startLocation: Vector,
    public endLocation: Vector,
    public width: number,
  ) {}
}

export class PenStroke extends Entity {
  public isHiddenBySectionCollapse: boolean = false;
  collisionBox: CollisionBox = new CollisionBox([]);
  public uuid: string;

  move(delta: Vector): void {
    for (const segment of this.path) {
      segment.startLocation = segment.startLocation.add(delta);
      segment.endLocation = segment.endLocation.add(delta);
    }
  }
  moveTo(location: Vector): void {
    for (const segment of this.path) {
      segment.startLocation = location.clone();
      segment.endLocation = location.clone();
    }
  }

  private path: PenStrokeSegment[] = [];
  private color: Color = StageStyleManager.currentStyle.StageObjectBorderColor;
  public getColor(): Color {
    return this.color;
  }

  /**
   *
   * @param path str格式："x1,y1,w1 x2,y2,w2 x3,y3,w3..."
   */
  constructor(path: string) {
    super();
    // 开始解析字符串
    const segments = path.split(" ");
    if (segments.length < 2) {
      throw new Error("字符串长度太短了");
    }
    // 生成一个随机的uuid
    this.uuid = v4();
    // 解析每一段
    for (let i = 0; i < segments.length - 1; i++) {
      const currentPointString = segments[i];
      const nextPointString = segments[i + 1];

      const currentPointStrList = currentPointString.split(",");
      const nextPointStrList = nextPointString.split(",");
      if (currentPointStrList.length < 3 || nextPointStrList.length < 3) {
        throw new Error("字符串格式不正确");
      }
      const currentPoint = new Vector(
        parseFloat(currentPointStrList[0]),
        parseFloat(currentPointStrList[1]),
      );
      const nextPoint = new Vector(
        parseFloat(nextPointStrList[0]),
        parseFloat(nextPointStrList[1]),
      );
      const width = parseFloat(currentPointStrList[2]);
      this.path.push(new PenStrokeSegment(currentPoint, nextPoint, width));
      // 生成碰撞箱，本质上是折线段
      this.collisionBox.shapeList.push(new Line(currentPoint, nextPoint));
    }
  }
}
