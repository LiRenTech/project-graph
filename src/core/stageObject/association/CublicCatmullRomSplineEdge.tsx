import { Serialized } from "../../../types/node";
import { CublicCatmullRomSpline } from "../../dataStruct/shape/CublicCatmullRomSpline";
import { Vector } from "../../dataStruct/Vector";
import { CollisionBox } from "../collisionBox/collisionBox";
import { TextNode } from "../entity/TextNode";
import { ConnectableEntity } from "../StageObject";
import { Edge } from "./Edge";
import { v4 as uuidv4 } from "uuid";

/**
 * CR曲线连线
 * 和早期的Edge一样，用于有向的连接两个实体，形成连接关系
 */
export class CublicCatmullRomSplineEdge extends Edge {
  public uuid: string;
  public text: string;
  protected _source: ConnectableEntity;
  protected _target: ConnectableEntity;

  private alpha = 0.5;
  private tension = 0;
  private controlPoints: Vector[] = [];

  private _collisionBox: CollisionBox;

  get collisionBox(): CollisionBox {
    return this._collisionBox;
  }

  static fromTwoEntity(
    source: ConnectableEntity,
    target: ConnectableEntity,
  ): CublicCatmullRomSplineEdge {
    // 处理控制点，控制点必须有四个，1 2 3 4，12可重叠，34可重叠
    const startLocation = source.geometryCenter.clone();
    const endLocation = target.geometryCenter.clone();

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
        [startLocation.x - 1, startLocation.y + 2],
        [endLocation.x + 2, endLocation.y - 1],
        [endLocation.x, endLocation.y],
      ],
    });
    return result;
  }

  constructor({
    uuid,
    source,
    target,
    text,
    alpha,
    tension,
    controlPoints,
  }: Serialized.CublicCatmullRomSplineEdge) {
    super();
    this._source = new TextNode({ uuid: source }, true);
    this._target = new TextNode({ uuid: target }, true);
    this.uuid = uuid;
    this.text = text;
    this.alpha = alpha;
    this.tension = tension;
    this.controlPoints = controlPoints.map(
      (item) => new Vector(item[0], item[1]),
    );
    this._collisionBox = new CollisionBox([
      new CublicCatmullRomSpline(this.controlPoints, this.alpha, this.tension),
    ]);
  }

  private test() {
    console.log(this.alpha, this.tension, this.controlPoints);
  }

  adjustSizeByText(): void {
    this.test();
  }
}
