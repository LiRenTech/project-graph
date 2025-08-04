import { Project } from "@/core/Project";
import { CircleChangeRadiusEffect } from "@/core/service/feedbackService/effectEngine/concrete/CircleChangeRadiusEffect";
import { ConnectableEntity } from "@/core/stage/stageObject/abstract/ConnectableEntity";
import { CollisionBox } from "@/core/stage/stageObject/collisionBox/collisionBox";
import { Vector } from "@graphif/data-structures";
import { passExtraAtArg1, passObject, serializable } from "@graphif/serializer";
import { Rectangle } from "@graphif/shapes";

// HACK: 【现在没问题了2025-7-9】这里继承了ConnectableEntity的话，TextNode模块就会报错，原因未知
// Uncaught ReferenceError: can't access lexical declaration 'ConnectableEntity' before initialization
@passExtraAtArg1
@passObject
export class ConnectPoint extends ConnectableEntity {
  get geometryCenter(): Vector {
    return this.collisionBox.getRectangle().center;
  }

  isHiddenBySectionCollapse: boolean = false;

  @serializable
  collisionBox: CollisionBox;
  @serializable
  uuid: string;

  private _radius = 10;
  get radius(): number {
    return this._radius;
  }
  set radius(value: number) {
    this._radius = value;
    const rectangle = this.collisionBox.shapes[0];
    if (rectangle instanceof Rectangle) {
      rectangle.size = new Vector(value * 2, value * 2);
      rectangle.location = this.geometryCenter.subtract(new Vector(value, value));
    }
  }

  /**
   * 节点是否被选中
   */
  _isSelected: boolean = false;

  /**
   * 获取节点的选中状态
   */
  public get isSelected() {
    return this._isSelected;
  }

  public set isSelected(value: boolean) {
    const oldValue = this._isSelected;
    if (oldValue === value) {
      return;
    }
    this._isSelected = value;
    if (value) {
      // 设定选中
      this.radius = 30;
      // this.project.effects.addEffect(
      //   CircleChangeRadiusEffect.fromConnectPointExpand(
      //     this.geometryCenter.clone(),
      //     30,
      //   ),
      // );
    } else {
      // 取消选中
      this.radius = 1;
      this.project.effects.addEffect(CircleChangeRadiusEffect.fromConnectPointShrink(this.geometryCenter.clone(), 30));
    }
  }

  constructor(
    protected readonly project: Project,
    {
      uuid = crypto.randomUUID() as string,
      collisionBox = new CollisionBox([new Rectangle(Vector.getZero(), Vector.getZero())]),
      details = "",
    },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;
    this.collisionBox = collisionBox;
    this.details = details;
    this.radius = 1;
  }

  move(delta: Vector): void {
    const newRectangle = this.collisionBox.getRectangle();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapes[0] = newRectangle;
    this.updateFatherSectionByMove();
  }

  moveTo(location: Vector): void {
    const newRectangle = this.collisionBox.getRectangle();
    newRectangle.location = location;
    this.collisionBox.shapes[0] = newRectangle;
    this.updateFatherSectionByMove();
  }
}
