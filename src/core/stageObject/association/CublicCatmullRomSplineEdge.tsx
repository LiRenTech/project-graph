import { Serialized } from "../../../types/node";
import { CollisionBox } from "../collisionBox/collisionBox";
import { TextNode } from "../entity/TextNode";
import { ConnectableAssociation } from "../StageObject";

/**
 * CR曲线连线
 * 和早期的Edge一样，用于有向的连接两个实体，形成连接关系
 */
export class CublicCatmullRomSplineEdge extends ConnectableAssociation {
  public uuid: string;
  public text: string;

  get collisionBox(): CollisionBox {
    // TODO 添加碰撞箱
    return new CollisionBox([]);
  }

  constructor({ uuid, source, target, text }: Serialized.Edge) {
    super();
    this.uuid = uuid;
    this.text = text;
    this.associationList.push(
      new TextNode({ uuid: target }, true),
      new TextNode({ uuid: source }, true),
    );
  }
}
