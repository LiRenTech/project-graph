import { Serialized } from "../../../types/node";
import { CollisionBox } from "../collisionBox/collisionBox";
import { TextNode } from "../entity/TextNode";
import { ConnectableAssociation } from "../StageObject";

export class BsplinesEdge extends ConnectableAssociation {
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
