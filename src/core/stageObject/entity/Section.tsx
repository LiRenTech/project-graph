import { Serialized } from "../../../types/node";
import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { NodeMoveShadowEffect } from "../../effect/concrete/NodeMoveShadowEffect";
import { Stage } from "../../stage/Stage";
import { CollisionBox } from "../collisionBox/collisionBox";
import { ConnectableEntity, Entity } from "../StageObject";

export class Section extends ConnectableEntity {
  /**
   * 节点是否被选中
   */
  _isSelected: boolean = false;
  public uuid: string;
  public collisionBox: CollisionBox;
  color: Color = Color.Transparent;
  text: string;
  children: Entity[] = [];
  /** 是否是折叠状态 */
  isCollapsed: boolean;
  /** 是否是隐藏状态 */
  isHidden: boolean;
  
  constructor({
    uuid,
    text = "",
    location = [0, 0],
    size = [0, 0],
    color = [0, 0, 0, 0],
    isHidden = false,
    isCollapsed = false,
  }: Partial<Serialized.Section> & { uuid: string }) {
    super();
    this.uuid = uuid;
    this.collisionBox = new CollisionBox([
      new Rectangle(new Vector(...location), new Vector(...size)),
    ]);
    this.color = new Color(...color);
    this.text = text;
    this.isHidden = isHidden;
    this.isCollapsed = isCollapsed;
  }

  /**
   * 获取节点的选中状态
   */
  public get isSelected() {
    return this._isSelected;
  }

  /**
   * 只读，获取节点的矩形
   * 若要修改节点的矩形，请使用 moveTo等 方法
   */
  public get rectangle(): Rectangle {
    return this.collisionBox.shapeList[0] as Rectangle;
  }

  public get geometryCenter() {
    return this.rectangle.location
      .clone()
      .add(this.rectangle.size.clone().multiply(0.5));
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
  }

  moveTo(location: Vector): void {
    const newRectangle = this.rectangle.clone();
    newRectangle.location = location.clone();
    this.collisionBox.shapeList[0] = newRectangle;
  }
}
