import { v4 as uuidv4 } from "uuid";
import { Serialized } from "../../../../types/node";
import { CublicCatmullRomSpline } from "../../../dataStruct/shape/CublicCatmullRomSpline";
import { Vector } from "../../../dataStruct/Vector";
import { ConnectableEntity } from "../abstract/ConnectableEntity";
import { CollisionBox } from "../collisionBox/collisionBox";
import { TextNode } from "../entity/TextNode";
import { Edge } from "./Edge";

/**
 * CR曲线连线
 * 和早期的Edge一样，用于有向的连接两个实体，形成连接关系
 */
export class CublicCatmullRomSplineEdge extends Edge {
  public uuid: string;
  public text: string;
  protected _source: ConnectableEntity;
  protected _target: ConnectableEntity;

  public alpha = 0.5;
  public tension = 0;
  private controlPoints: Vector[] = [];
  public getControlPoints(): Vector[] {
    return this.controlPoints;
  }

  // 实验性的增加控制点
  public addControlPoint() {
    if (this.controlPoints.length >= 4) {
      // 获取倒数第二个和倒数第三个控制点
      const secondLastPoint = this.controlPoints[this.controlPoints.length - 2];
      const thirdLastPoint = this.controlPoints[this.controlPoints.length - 3];
      // 计算中间控制点
      const middlePoint = Vector.fromTwoPointsCenter(secondLastPoint, thirdLastPoint);
      // 将新的控制点插入到数组对应的位置上
      this.controlPoints.splice(this.controlPoints.length - 2, 0, middlePoint);
    }
  }

  private _collisionBox: CollisionBox;

  get collisionBox(): CollisionBox {
    return this._collisionBox;
  }

  static fromTwoEntity(source: ConnectableEntity, target: ConnectableEntity): CublicCatmullRomSplineEdge {
    // 处理控制点，控制点必须有四个，1 2 3 4，12可重叠，34可重叠
    const startLocation = source.geometryCenter.clone();
    const endLocation = target.geometryCenter.clone();
    const line = Edge.getCenterLine(source, target);

    const result = new CublicCatmullRomSplineEdge({
      source: source.uuid,
      target: target.uuid,
      text: "",
      uuid: uuidv4(),
      type: "core:cublic_catmull_rom_spline_edge",
      alpha: 0.5,
      tension: 0,
      controlPoints: [
        [startLocation.x, startLocation.y],
        [line.start.x, line.start.y],
        [line.end.x, line.end.y],
        [endLocation.x, endLocation.y],
      ],
    });
    return result;
  }

  constructor(
    {
      uuid,
      source,
      target,
      text,
      alpha,
      tension,
      controlPoints,
    }: Serialized.CublicCatmullRomSplineEdge /** true表示解析状态，false表示解析完毕 */,
    public unknown = false,
  ) {
    super();
    // this._source = StageManager.getTextNodeByUUID(source) as TextNode;
    // this._target = StageManager.getTextNodeByUUID(target) as TextNode;
    this._source = new TextNode({ uuid: source }, true);
    this._target = new TextNode({ uuid: target }, true);
    this.uuid = uuid;
    this.text = text;
    this.alpha = alpha;
    this.tension = tension;
    this.controlPoints = controlPoints.map((item) => new Vector(item[0], item[1]));

    this._collisionBox = new CollisionBox([new CublicCatmullRomSpline(this.controlPoints, this.alpha, this.tension)]);
  }

  public getShape(): CublicCatmullRomSpline {
    // 重新计算形状
    const crShape = this._collisionBox.shapeList[0] as CublicCatmullRomSpline;
    this.autoUpdateControlPoints(); // ?
    return crShape;
  }

  autoUpdateControlPoints() {
    // 只更新起始点和结束点
    const startLocation = this._source.collisionBox.getRectangle().center;
    const endLocation = this._target.collisionBox.getRectangle().center;
    const line = Edge.getCenterLine(this._source, this._target);
    if (this.controlPoints.length <= 4) {
      this.controlPoints = [startLocation, line.start, line.end, endLocation];
    } else {
      // 截取出除去前两个和最后两个控制点，获取全部的中间控制点
      const middleControlPoints = this.controlPoints.slice(2, -2);
      this.controlPoints = [startLocation, line.start].concat(middleControlPoints).concat([line.end, endLocation]);
    }
    // 重新生成新的形状
    this._collisionBox.shapeList = [new CublicCatmullRomSpline(this.controlPoints, this.alpha, this.tension)];
  }

  adjustSizeByText(): void {}
}
