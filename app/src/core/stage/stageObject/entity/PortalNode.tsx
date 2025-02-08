import { Serialized } from "../../../../types/node";
import { Color } from "../../../dataStruct/Color";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { NodeMoveShadowEffect } from "../../../service/feedbackService/effectEngine/concrete/NodeMoveShadowEffect";
import { Stage } from "../../Stage";
import { ConnectableEntity } from "../abstract/ConnectableEntity";
import { CollisionBox } from "../collisionBox/collisionBox";

export class PortalNode extends ConnectableEntity {
  static TITLE_HEIGHT = 100;
  isHiddenBySectionCollapse: boolean = false;
  public uuid: string;
  public collisionBox: CollisionBox;

  public title: string;
  public size: Vector;
  get location(): Vector {
    return this.collisionBox.getRectangle().location;
  }
  color: Color = Color.Transparent;
  public portalFilePath: string;
  public targetLocation: Vector;
  public cameraScale: number;

  constructor(
    {
      uuid,
      title = "",
      portalFilePath = "",
      targetLocation = [0, 0],
      cameraScale = 1,
      location = [0, 0],
      size = [0, 0],
      color = [0, 0, 0, 0],
    }: Partial<Serialized.PortalNode> & { uuid: string },
    public unknown = false,
  ) {
    super();
    this.uuid = uuid;
    this.title = title;
    this.size = new Vector(...size);
    this.color = new Color(...color);
    this.portalFilePath = portalFilePath;
    this.targetLocation = new Vector(...targetLocation);
    this.cameraScale = cameraScale;
    this.collisionBox = new CollisionBox([new Rectangle(new Vector(...location), new Vector(...size))]);
  }

  public get geometryCenter() {
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
    const newRectangle = this.collisionBox.getRectangle().clone();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapeList[0] = newRectangle;

    // 移动雪花特效
    Stage.effectMachine.addEffect(new NodeMoveShadowEffect(new ProgressNumber(0, 30), newRectangle, delta));
    this.updateFatherSectionByMove();
    // 移动其他实体，递归碰撞
    this.updateOtherEntityLocationByMove();
  }
  moveTo(location: Vector): void {
    const newRectangle = this.collisionBox.getRectangle();
    newRectangle.location = location.clone();
    this.collisionBox.shapeList[0] = newRectangle;
    this.updateFatherSectionByMove();
  }
}
