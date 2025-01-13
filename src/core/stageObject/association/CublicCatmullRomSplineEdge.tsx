import { Serialized } from "../../../types/node";
import { CollisionBox } from "../collisionBox/collisionBox";
import { TextNode } from "../entity/TextNode";
import { ConnectableEntity } from "../StageObject";
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

  get collisionBox(): CollisionBox {
    // TODO 添加碰撞箱
    return new CollisionBox([]);
  }

  constructor({ uuid, source, target, text }: Serialized.Edge) {
    super();
    this._source = new TextNode({ uuid: source }, true);
    this._target = new TextNode({ uuid: target }, true);
    this.uuid = uuid;
    this.text = text;
  }

  adjustSizeByText(): void {}
}
