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
    for (const segment of this.segmentList) {
      segment.startLocation = segment.startLocation.add(delta);
      segment.endLocation = segment.endLocation.add(delta);
    }
    this.updateCollisionBoxBySegmentList();
  }
  moveTo(location: Vector): void {
    for (const segment of this.segmentList) {
      segment.startLocation = location.clone();
      segment.endLocation = location.clone();
    }
    this.updateCollisionBoxBySegmentList();
  }

  private updateCollisionBoxBySegmentList() {
    this.collisionBox.shapeList = [];
    for (const segment of this.segmentList) {
      this.collisionBox.shapeList.push(new Line(segment.startLocation, segment.endLocation));
    }
  }

  private segmentList: PenStrokeSegment[] = [];
  private color: Color = StageStyleManager.currentStyle.StageObjectBorderColor;
  public getColor(): Color {
    return this.color;
  }
  public getPath(): Vector[] {
    const result: Vector[] = [];
    for (const segment of this.segmentList) {
      result.push(segment.startLocation);
    }
    return result;
  }
  public getSegmentList(): PenStrokeSegment[] {
    return this.segmentList;
  }

  /**
   *
   * @param path str格式："x1,y1,w1 x2,y2,w2 x3,y3,w3..."
   */
  constructor(path: string) {
    super();
    // 开始解析字符串
    this.checkType(path);
    const segments = path.split("~");

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
      const currentPoint = new Vector(parseFloat(currentPointStrList[0]), parseFloat(currentPointStrList[1]));
      const nextPoint = new Vector(parseFloat(nextPointStrList[0]), parseFloat(nextPointStrList[1]));
      const width = parseFloat(currentPointStrList[2]);
      this.segmentList.push(new PenStrokeSegment(currentPoint, nextPoint, width));
      // 生成碰撞箱，本质上是折线段
      this.collisionBox.shapeList.push(new Line(currentPoint, nextPoint));
    }
  }

  dumpString(): string {
    const resultList: string[] = [];
    for (const segment of this.segmentList) {
      resultList.push(`${segment.startLocation.x},${segment.startLocation.y},${segment.width}`);
    }
    // 还要把最后一段的结尾加进来
    const tailSegment = this.segmentList[this.segmentList.length - 1];
    resultList.push(`${tailSegment.startLocation.x},${tailSegment.startLocation.y},${tailSegment.width}`);
    return resultList.join("~");
  }

  /**
   * 检查格式是否合适
   * @param origin
   */
  checkType(origin: string) {
    if (!origin.includes("~")) {
      throw new Error("字符串格式不正确，没有分隔号");
    }
    const segments = origin.split("~");
    for (let i = 0; i < segments.length - 1; i++) {
      const currentPointString = segments[i];
      const nextPointString = segments[i + 1];
      const currentPointStrList = currentPointString.split(",");
      const nextPointStrList = nextPointString.split(",");
      if (currentPointStrList.length < 3 || nextPointStrList.length < 3) {
        throw new Error("字符串格式不正确");
      }
      const currentPoint = new Vector(parseFloat(currentPointStrList[0]), parseFloat(currentPointStrList[1]));
      const nextPoint = new Vector(parseFloat(nextPointStrList[0]), parseFloat(nextPointStrList[1]));
      if (isNaN(currentPoint.x) || isNaN(currentPoint.y) || isNaN(nextPoint.x) || isNaN(nextPoint.y)) {
        throw new Error("坐标格式不正确");
      }
      const width = parseFloat(currentPointStrList[2]);
      if (width <= 0) {
        throw new Error("宽度必须大于0");
      }
    }
  }
}
