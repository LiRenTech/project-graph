import { Serialized } from "../../../types/node";
import { getTextSize } from "../../../utils/font";
import { Color } from "../../dataStruct/Color";
import { ProgressNumber } from "../../dataStruct/ProgressNumber";
import { Line } from "../../dataStruct/shape/Line";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { NodeMoveShadowEffect } from "../../effect/concrete/NodeMoveShadowEffect";
import { Renderer } from "../../render/canvas2d/renderer";
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

  private _collisionBoxWhenCollapsed: CollisionBox;
  private _collisionBoxNormal: CollisionBox;

  public get collisionBox(): CollisionBox {
    if (this.isCollapsed) {
      return this._collisionBoxWhenCollapsed;
    } else {
      return this._collisionBoxNormal;
    }
  }

  /** 获取折叠状态下的碰撞箱 */
  private collapsedCollisionBox(): CollisionBox {
    const centerLocation = this._collisionBoxNormal.getRectangle().center;
    const collapsedRectangleSize = getTextSize(
      this.text,
      Renderer.FONT_SIZE,
    ).add(Vector.same(Renderer.NODE_PADDING).multiply(2));
    const collapsedRectangle = new Rectangle(
      centerLocation.clone().subtract(collapsedRectangleSize.multiply(0.5)),
      collapsedRectangleSize,
    );
    return new CollisionBox([collapsedRectangle]);
  }

  color: Color = Color.Transparent;
  text: string;
  children: Entity[];
  /** 是否是折叠状态 */
  isCollapsed: boolean;
  /** 是否是隐藏状态 */
  isHidden: boolean;
  isHiddenBySectionCollapse = false;

  constructor(
    {
      uuid,
      text = "",
      location = [0, 0],
      size = [0, 0],
      color = [0, 0, 0, 0],
      isHidden = false,
      isCollapsed = false,
      children = [],
    }: Partial<Serialized.Section> & { uuid: string },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;

    // TODO: 应该把collisionBox写成一个访问属性。然后有两个状态下的碰撞箱，分别在isCollapsed和!isCollapsed时生成。
    this._collisionBoxWhenCollapsed = new CollisionBox([
      new Rectangle(new Vector(...location), new Vector(...size)),
    ]);
    console.log(
      "this._collisionBoxWhenCollapsed",
      this._collisionBoxWhenCollapsed,
    );
    this._collisionBoxNormal = new CollisionBox(
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
    console.log("开始根据实体创建");
    const section = new Section({
      uuid: uuidv4(),
      text: "section",
      location: [0, 0],
      size: [0, 0],
      color: [0, 0, 0, 0],
      isHidden: false,
      isCollapsed: false,
      children: entities.map((entity) => entity.uuid),
    });
    console.log("创建完毕");
    return section;
  }

  rename(newName: string) {
    this.text = newName;
  }

  adjustLocationAndSize() {
    if (this.children.length === 0) {
      return;
    }
    // 调整展开状态
    const rectangle = Rectangle.getBoundingRectangle(
      this.children.map((child) => child.collisionBox.getRectangle()),
      15,
    );
    rectangle.location = rectangle.location.subtract(new Vector(0, 50));
    rectangle.size = rectangle.size.add(new Vector(0, 50));

    this._collisionBoxNormal.shapeList = rectangle.getBoundingLines();
    // 调整折叠状态
    this._collisionBoxWhenCollapsed = this.collapsedCollisionBox();
  }

  /**
   * 获取节点的选中状态
   */
  public get isSelected() {
    return this._isSelected;
  }
  public set isSelected(value: boolean) {
    this._isSelected = value;
  }

  /**
   * 只读，获取节点的矩形
   * 若要修改节点的矩形，请使用 moveTo等 方法
   */
  public get rectangle(): Rectangle {
    if (this.isCollapsed) {
      return this._collisionBoxWhenCollapsed.getRectangle();
    } else {
      const topLine: Line = this._collisionBoxNormal.shapeList[0] as Line;
      const rightLine: Line = this._collisionBoxNormal.shapeList[1] as Line;
      const bottomLine: Line = this._collisionBoxNormal.shapeList[2] as Line;
      const leftLine: Line = this._collisionBoxNormal.shapeList[3] as Line;
      return new Rectangle(
        new Vector(leftLine.start.x, topLine.start.y),
        new Vector(
          rightLine.end.x - leftLine.start.x,
          bottomLine.end.y - topLine.start.y,
        ),
      );
    }
  }

  public get geometryCenter() {
    return this.rectangle.location
      .clone()
      .add(this.rectangle.size.clone().multiply(0.5));
  }

  move(delta: Vector): void {
    // 让自己移动
    for (const line of this.collisionBox.shapeList) {
      if (line instanceof Line) {
        line.start = line.start.add(delta);
        line.end = line.end.add(delta);
      } else if (line instanceof Rectangle) {
        line.location = line.location.add(delta);
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
