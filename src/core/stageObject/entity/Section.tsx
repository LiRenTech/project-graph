import { Serialized } from "../../../types/node";
import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Line } from "../../dataStruct/shape/Line";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { NodeMoveShadowEffect } from "../../effect/concrete/NodeMoveShadowEffect";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";
import { CollisionBox } from "../collisionBox/collisionBox";
import { ConnectableEntity, Entity } from "../StageObject";
import { v4 as uuidv4 } from "uuid";

export class Section extends ConnectableEntity {
  /**
   * 节点是否被选中
   */
  _isSelected: boolean = false;
  public uuid: string;
  public collisionBox: CollisionBox;
  color: Color = Color.Transparent;
  text: string;
  children: Entity[];
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
    children = [],
  }: Partial<Serialized.Section> & { uuid: string }) {
    super();
    this.uuid = uuid;
    this.collisionBox = new CollisionBox(
      new Rectangle(
        new Vector(...location),
        new Vector(...size),
      ).getBoundingLines(),
    );
    this.color = new Color(...color);
    this.text = text;
    this.isHidden = isHidden;
    this.isCollapsed = isCollapsed;
    this.children = StageManager.getEntitiesByUUIDs(children);
    // 一定要放在最后
    this.adjustLocationAndSize();
  }

  isHaveChildrenByUUID(uuid: string): boolean {
    return this.children.some((child) => child.uuid === uuid);
  }

  /**
   * 根据多个实体创建节点
   * @param entities
   */
  static fromEntities(entities: Entity[]): Section {
    const section = new Section({
      uuid: uuidv4(),
      text: "xxx",
      location: [0, 0],
      size: [0, 0],
      color: [0, 0, 0, 0],
      isHidden: false,
      isCollapsed: false,
      children: entities.map((entity) => entity.uuid),
    });
    return section;
  }

  adjustLocationAndSize() {
    if (this.children.length === 0) {
      return;
    }

    this.collisionBox.shapeList = Rectangle.getBoundingRectangle(
      this.children.map((child) => child.collisionBox.getRectangle()),
      15,
    ).getBoundingLines();
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
    const topLine: Line = this.collisionBox.shapeList[0] as Line;
    const rightLine: Line = this.collisionBox.shapeList[1] as Line;
    const bottomLine: Line = this.collisionBox.shapeList[2] as Line;
    const leftLine: Line = this.collisionBox.shapeList[3] as Line;
    return new Rectangle(
      new Vector(leftLine.start.x, topLine.start.y),
      new Vector(
        rightLine.end.x - leftLine.start.x,
        bottomLine.end.y - topLine.start.y,
      ),
    );
  }

  public get geometryCenter() {
    return this.rectangle.location
      .clone()
      .add(this.rectangle.size.clone().multiply(0.5));
  }

  move(delta: Vector): void {
    for (const line of this.collisionBox.shapeList) {
      if (line instanceof Line) {
        line.start.add(delta);
        line.end.add(delta);
      }
    }

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
    const currentLeftTop = this.rectangle.location;
    const delta = location.clone().subtract(currentLeftTop);
    this.move(delta);
  }
}
