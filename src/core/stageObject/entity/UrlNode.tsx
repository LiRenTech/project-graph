import { Serialized } from "../../../types/node";
import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { NodeMoveShadowEffect } from "../../effect/concrete/NodeMoveShadowEffect";
import { Stage } from "../../stage/Stage";
import { CollisionBox } from "../collisionBox/collisionBox";
import { ConnectableEntity } from "../StageObject";

/**
 * 网页链接节点
 * 通过在舞台上ctrl+v触发创建
 * 一旦创建，url就不能改了，因为也不涉及修改。
 */
export class UrlNode extends ConnectableEntity {
  uuid: string;
  title: string;
  // 网页链接
  url: string;
  color: Color;
  public collisionBox: CollisionBox;

  static width: number = 300;
  static height: number = 150;

  get geometryCenter(): Vector {
    return this.collisionBox.getRectangle().center;
  }
  /**
   * 只读，获取节点的矩形
   * 若要修改节点的矩形，请使用 moveTo等 方法
   */
  public get rectangle(): Rectangle {
    return this.collisionBox.shapeList[0] as Rectangle;
  }
  move(delta: Vector): void {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapeList[0] = newRectangle;

    // 移动雪花特效
    Stage.effects.push(
      new NodeMoveShadowEffect(
        new ProgressNumber(0, 30),
        this.rectangle,
        delta,
      ),
    );
    this.updateFatherSectionByMove();
    // 移动其他实体，递归碰撞
    this.updateOtherEntityLocationByMove();
  }
  moveTo(location: Vector): void {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = location.clone();
    this.collisionBox.shapeList[0] = newRectangle;
    this.updateFatherSectionByMove();
  }
  isHiddenBySectionCollapse: boolean = false;

  constructor({
    uuid,
    title = "",
    details = "",
    url = "",
    location = [0, 0],
    size = [UrlNode.width, UrlNode.height],
    color = [0, 0, 0, 0],
  }: Partial<Serialized.UrlNode> & { uuid: string }) {
    super();
    this.uuid = uuid;
    this.details = details;
    this.title = title;
    this.url = url;
    this.color = new Color(...color);
    this.collisionBox = new CollisionBox([
      new Rectangle(new Vector(...location), new Vector(...size)),
    ]);
  }

  rename(title: string): void {
    this.title = title;
  }
}
