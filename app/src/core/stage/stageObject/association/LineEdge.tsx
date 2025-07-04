import { v4 as uuidv4 } from "uuid";
import { Serialized } from "../../../../types/node";
import { getMultiLineTextSize } from "../../../../utils/font";
import { Project } from "../../../Project";
import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";
import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Renderer } from "../../../render/canvas2d/renderer";
import { ConnectableEntity } from "../abstract/ConnectableEntity";
import { CollisionBox } from "../collisionBox/collisionBox";
import { TextNode } from "../entity/TextNode";
import { Edge } from "./Edge";
import { EdgeCollisionBoxGetter } from "./EdgeCollisionBoxGetter";

export class LineEdge extends Edge {
  public uuid: string;
  public text: string;
  public color: Color = Color.Transparent;

  protected _source: ConnectableEntity;
  protected _target: ConnectableEntity;

  get collisionBox(): CollisionBox {
    return EdgeCollisionBoxGetter.getCollisionBox(this);
  }

  /**
   * 是否是偏移状态
   * 偏移是为双向线准备的 A->B, B->A，防止重叠
   */
  get isShifting(): boolean {
    return this._isShifting;
  }
  set isShifting(value: boolean) {
    this._isShifting = value;
  }
  private _isShifting: boolean = false;

  constructor(
    protected readonly project: Project,
    { source, target, text, uuid, color, sourceRectRate, targetRectRate }: Serialized.LineEdge,
    /** true表示解析状态，false表示解析完毕 */
    public unknown = false,
  ) {
    super();
    this._source = new TextNode(this.project, { uuid: source }, true);
    this._target = new TextNode(this.project, { uuid: target }, true);
    this.text = text;
    this.uuid = uuid;
    this.color = new Color(...color);
    this.setSourceRectangleRate(new Vector(sourceRectRate[0], sourceRectRate[1]));
    this.setTargetRectangleRate(new Vector(targetRectRate[0], targetRectRate[1]));

    this.adjustSizeByText();
  }

  // warn: 暂时无引用
  static fromTwoEntity(project: Project, source: ConnectableEntity, target: ConnectableEntity): LineEdge {
    const result = new LineEdge(project, {
      source: source.uuid,
      target: target.uuid,
      text: "",
      uuid: uuidv4(),
      sourceRectRate: [0.5, 0.5],
      targetRectRate: [0.5, 0.5],
      type: "core:line_edge",
      color: [0, 0, 0, 0],
    });
    return result;
  }

  public rename(text: string) {
    this.text = text;
    this.adjustSizeByText();
  }

  get textRectangle(): Rectangle {
    // HACK: 这里会造成频繁渲染，频繁计算文字宽度进而可能出现性能问题
    const textSize = getMultiLineTextSize(this.text, Renderer.FONT_SIZE, 1.2);
    if (this.isShifting) {
      return new Rectangle(this.shiftingMidPoint.subtract(textSize.divide(2)), textSize);
    } else {
      return new Rectangle(this.bodyLine.midPoint().subtract(textSize.divide(2)), textSize);
    }
  }

  get shiftingMidPoint(): Vector {
    const midPoint = Vector.average(
      this.source.collisionBox.getRectangle().center,
      this.target.collisionBox.getRectangle().center,
    );
    return midPoint.add(
      this.target.collisionBox
        .getRectangle()
        .getCenter()
        .subtract(this.source.collisionBox.getRectangle().getCenter())
        .normalize()
        .rotateDegrees(90)
        .multiply(50),
    );
  }

  adjustSizeByText(): void {}
}
