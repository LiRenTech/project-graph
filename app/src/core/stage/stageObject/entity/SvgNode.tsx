import { Serialized } from "../../../../types/node";
import { Color } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { ConnectableEntity } from "../abstract/ConnectableEntity";
import { CollisionBox } from "../collisionBox/collisionBox";

/**
 * Svg 节点
 */
export class SvgNode extends ConnectableEntity {
  color: Color = Color.Transparent;
  uuid: string;
  details: string;
  scaleNumber: number;
  public collisionBox: CollisionBox;
  content: string;
  location: Vector;
  isHiddenBySectionCollapse: boolean = false;

  constructor({
    uuid,
    details = "",
    content = "",
    location = [0, 0],
    size = [0, 0],
    scale = 1,
    color = [0, 0, 0, 0],
  }: Partial<Serialized.SvgNode> & { uuid: string }) {
    super();
    this.uuid = uuid;
    this.details = details;
    this.scaleNumber = scale;
    this.content = content;
    this.location = new Vector(...location);
    this.color = new Color(...color);

    this.collisionBox = new CollisionBox([
      new Rectangle(new Vector(...location), new Vector(...size).multiply(this.scaleNumber)),
    ]);
  }

  public get geometryCenter(): Vector {
    return this.collisionBox.getRectangle().center;
  }

  move(delta: Vector): void {
    const newRectangle = this.collisionBox.getRectangle().clone();
    newRectangle.location = newRectangle.location.add(delta);
    this.collisionBox.shapeList[0] = newRectangle;
    this.location = newRectangle.location.clone();
    this.updateFatherSectionByMove();
  }

  moveTo(location: Vector): void {
    const newRectangle = this.collisionBox.getRectangle().clone();
    newRectangle.location = location.clone();
    this.collisionBox.shapeList[0] = newRectangle;
    this.location = newRectangle.location.clone();
    this.updateFatherSectionByMove();
  }
}
