import { v4 as uuidv4 } from "uuid";
import { Serialized } from "../../../../types/node";
import { getTextSize } from "../../../../utils/font";
import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Line } from "../../../dataStruct/shape/Line";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Shape } from "../../../dataStruct/shape/Shape";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { NodeMoveShadowEffect } from "../../../service/feedbackService/effectEngine/concrete/NodeMoveShadowEffect";
import { Stage } from "../../Stage";
import { StageManager } from "../../stageManager/StageManager";
import { ConnectableEntity } from "../abstract/ConnectableEntity";
import { Entity } from "../abstract/StageEntity";
import { CollisionBox } from "../collisionBox/collisionBox";
import { SectionMethods } from "../../stageManager/basicMethods/SectionMethods";

export class Section extends ConnectableEntity {
  /**
   * 节点是否被选中
   */
  _isSelected: boolean = false;
  public uuid: string;
  public isEditingTitle: boolean = false;
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
    const collapsedRectangleSize = getTextSize(this.text, Renderer.FONT_SIZE).add(
      Vector.same(Renderer.NODE_PADDING).multiply(2),
    );
    const collapsedRectangle = new Rectangle(
      centerLocation.clone().subtract(collapsedRectangleSize.multiply(0.5)),
      collapsedRectangleSize,
    );
    return new CollisionBox([collapsedRectangle]);
  }

  color: Color = Color.Transparent;
  text: string;

  /**
   * 此数组要跟随 childrenUUIDs 变化而变化
   * 字符串数组才是老大
   */
  children: Entity[];
  childrenUUIDs: string[];

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
      details = "",
    }: Partial<Serialized.Section> & { uuid: string },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;

    this._collisionBoxWhenCollapsed = new CollisionBox([new Rectangle(new Vector(...location), new Vector(...size))]);

    const shapeList: Shape[] = new Rectangle(new Vector(...location), new Vector(...size)).getBoundingLines();
    // shapeList.push(
    //   new Rectangle(new Vector(...location), new Vector(size[0], 50)),
    // );
    this._collisionBoxNormal = new CollisionBox(shapeList);

    this.color = new Color(...color);
    this.text = text;
    this.isHidden = isHidden;
    this.isCollapsed = isCollapsed;
    this.details = details;
    this.childrenUUIDs = children;
    this.children = StageManager.getEntitiesByUUIDs(children);
    // 一定要放在最后
    this.adjustLocationAndSize();
  }

  isHaveChildrenByUUID(uuid: string): boolean {
    return this.childrenUUIDs.includes(uuid);
    // return this.children.some((child) => child.uuid === uuid);
  }

  /**
   * 根据多个实体创建Section
   * @param entities
   */
  static fromEntities(entities: Entity[]): Section {
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

    return section;
  }

  rename(newName: string) {
    this.text = newName;
    this.adjustLocationAndSize();
  }

  adjustLocationAndSize() {
    let rectangle: Rectangle;
    const titleSize = getTextSize(this.text, Renderer.FONT_SIZE);

    if (this.children.length === 0) {
      rectangle = new Rectangle(
        this.collisionBox.getRectangle().location,
        new Vector(Math.max(titleSize.x + Renderer.NODE_PADDING * 2, 100), 100),
      );
    } else {
      // 调整展开状态
      rectangle = Rectangle.getBoundingRectangle(
        this.children.map((child) => child.collisionBox.getRectangle()),
        30,
      );
      rectangle.size.x = Math.max(rectangle.size.x, titleSize.x + Renderer.NODE_PADDING * 2);
      // 留白范围在上面调整
      rectangle.location = rectangle.location.subtract(new Vector(0, 50));
      rectangle.size = rectangle.size.add(new Vector(0, 50));
    }

    this._collisionBoxNormal.shapeList = rectangle.getBoundingLines();
    // 群友需求：希望Section框扩大交互范围，标题也能拖动
    const newRect = new Rectangle(rectangle.location.clone(), new Vector(rectangle.size.x, 50));
    this._collisionBoxNormal.shapeList.push(newRect);
    // 调整折叠状态
    this._collisionBoxWhenCollapsed = this.collapsedCollisionBox();
  }
  /**
   * 根据自身的折叠状态调整子节点的状态
   * 以屏蔽触碰和显示
   */
  adjustChildrenStateByCollapse() {
    if (this.isCollapsed) {
      this.children.forEach((child) => {
        if (child instanceof Section) {
          child.adjustChildrenStateByCollapse();
        }
        child.isHiddenBySectionCollapse = true;
      });
    }
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
        new Vector(rightLine.end.x - leftLine.start.x, bottomLine.end.y - topLine.start.y),
      );
    }
  }

  public get geometryCenter() {
    return this.rectangle.location.clone().add(this.rectangle.size.clone().multiply(0.5));
  }

  move(delta: Vector): void {
    // 让自己移动
    for (const shape of this.collisionBox.shapeList) {
      if (shape instanceof Line) {
        shape.start = shape.start.add(delta);
        shape.end = shape.end.add(delta);
      } else if (shape instanceof Rectangle) {
        shape.location = shape.location.add(delta);
      }
    }
    // 让内部元素也移动
    for (const child of this.children) {
      child.move(delta);
    }

    // 移动雪花特效
    Stage.effectMachine.addEffect(new NodeMoveShadowEffect(new ProgressNumber(0, 30), this.rectangle, delta));
    this.updateFatherSectionByMove();
    // 移动其他实体，递归碰撞
    this.updateOtherEntityLocationByMove();
  }
  protected override collideWithOtherEntity(other: Entity): void {
    if (!StageManager.isEnableEntityCollision) {
      return;
    }
    if (other instanceof Section) {
      if (SectionMethods.isEntityInSection(this, other)) {
        return;
      }
    }
    if (SectionMethods.isEntityInSection(other, this)) {
      return;
    }
    super.collideWithOtherEntity(other);
  }

  /**
   * 将某个物体 的最小外接矩形的左上角位置 移动到某个位置
   * @param location
   */
  moveTo(location: Vector): void {
    const currentLeftTop = this.rectangle.location;
    const delta = location.clone().subtract(currentLeftTop);
    this.move(delta);
    this.updateFatherSectionByMove();
  }
}
