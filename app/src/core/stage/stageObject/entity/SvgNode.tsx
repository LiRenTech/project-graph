import { Serialized } from "../../../../types/node";
import { Color } from "../../../dataStruct/Color";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { SvgRenderer } from "../../../render/canvas2d/basicRenderer/svgRenderer";
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
  originSize: Vector;
  state: "loading" | "loaded" = "loading";
  isHiddenBySectionCollapse: boolean = false;

  constructor({
    uuid,
    details = "",
    content = "",
    location = [0, 0],
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

    this.originSize = new Vector(100, 100);
    // 解析svg尺寸
    SvgRenderer.getSvgOriginalSize(content).then((size) => {
      this.originSize = size;
      this.collisionBox = new CollisionBox([
        new Rectangle(new Vector(...location), this.originSize.multiply(this.scaleNumber)),
      ]);
      this.state = "loaded";
    });

    this.collisionBox = new CollisionBox([
      new Rectangle(new Vector(...location), this.originSize.multiply(this.scaleNumber)),
    ]);
  }

  public get geometryCenter(): Vector {
    return this.collisionBox.getRectangle().center;
  }

  public scaleUpdate(scaleDiff: number) {
    this.scaleNumber += scaleDiff;
    if (this.scaleNumber < 0.1) {
      this.scaleNumber = 0.1;
    }
    if (this.scaleNumber > 10) {
      this.scaleNumber = 10;
    }

    this.collisionBox = new CollisionBox([new Rectangle(this.location, this.originSize.multiply(this.scaleNumber))]);
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
