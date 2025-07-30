import { Vector } from "@graphif/data-structures";
import { Rectangle } from "@graphif/shapes";
import { Serialized } from "@/types/node";
import { Project } from "@/core/Project";
import { CircleChangeRadiusEffect } from "@/core/service/feedbackService/effectEngine/concrete/CircleChangeRadiusEffect";
import { ConnectableEntity } from "@/core/stage/stageObject/abstract/ConnectableEntity";
import { CollisionBox } from "@/core/stage/stageObject/collisionBox/collisionBox";

// TODO: 这里继承了ConnectableEntity的话，TextNode模块就会报错，原因未知
// Uncaught ReferenceError: can't access lexical declaration 'ConnectableEntity' before initialization
export class ConnectPoint extends ConnectableEntity {
  get geometryCenter(): Vector {
    return this.location;
  }

  isHiddenBySectionCollapse: boolean = false;

  private _collisionBox: CollisionBox;

  public get collisionBox(): CollisionBox {
    return this._collisionBox;
  }
  uuid: string;
  private location: Vector;

  private _radius = 10;
  get radius(): number {
    return this._radius;
  }
  set radius(value: number) {
    this._radius = value;
    const rectangle = this._collisionBox.shapes[0];
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
    { uuid, location = [0, 0], details = "" }: Partial<Serialized.ConnectPoint> & { uuid: string },
    public unknown = false,
  ) {
    // super();
    this.uuid = uuid;
    this.location = new Vector(...location);
    this.details = details;
    this._collisionBox = new CollisionBox([
      new Rectangle(this.location.subtract(new Vector(10, 10)), new Vector(20, 20)),
    ]);
    this.radius = 1;
  }

  move(delta: Vector): void {
    this.location = this.location.add(delta);

    const rectangle = this._collisionBox.shapes[0];
    if (rectangle instanceof Rectangle) {
      rectangle.location = rectangle.location.add(delta);
    }
    this.updateFatherSectionByMove();
  }

  moveTo(location: Vector): void {
    this.location = location;

    const rectangle = this._collisionBox.shapes[0];
    if (rectangle instanceof Rectangle) {
      rectangle.location = location.subtract(new Vector(10, 10));
    }
    this.updateFatherSectionByMove();
  }
}
