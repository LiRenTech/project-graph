import { Serialized } from "../../../types/node";
import { getTextSize } from "../../../utils/font";
import { Vector } from "../../dataStruct/Vector";
import { Line } from "../../dataStruct/shape/Line";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Renderer } from "../../render/canvas2d/renderer";
import { CollisionBox } from "../collisionBox/collisionBox";
import { TextNode } from "../entity/TextNode";
import { EdgeCollisionBoxGetter } from "./EdgeCollisionBoxGetter";
import { Edge } from "./Edge";
import { ConnectableEntity } from "../StageObject";
import { v4 as uuidv4 } from "uuid";

export class LineEdge extends Edge {
  public uuid: string;
  public text: string;

  protected _source: ConnectableEntity;
  protected _target: ConnectableEntity;

  get collisionBox(): CollisionBox {
    return EdgeCollisionBoxGetter.getCollisionBox(this);
  }

  get isHiddenBySectionCollapse(): boolean {
    return (
      this.source.isHiddenBySectionCollapse &&
      this.target.isHiddenBySectionCollapse
    );
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
    { source, target, text, uuid }: Serialized.LineEdge,
    /** true表示解析状态，false表示解析完毕 */
    public unknown = false,
  ) {
    super();
    this._source = new TextNode({ uuid: source }, true);
    this._target = new TextNode({ uuid: target }, true);
    this.text = text;
    this.uuid = uuid;

    this.adjustSizeByText();
  }

  static fromTwoEntity(
    source: ConnectableEntity,
    target: ConnectableEntity,
  ): LineEdge {
    const result = new LineEdge({
      source: source.uuid,
      target: target.uuid,
      text: "",
      uuid: uuidv4(),
      type: "core:line_edge",
    });
    return result;
  }

  /**
   * 获取身体的碰撞箱
   * 这个碰撞箱是贯穿两个节点的线段
   */
  get bodyLine(): Line {
    const edgeCenterLine = new Line(
      this.source.collisionBox.getRectangle().center,
      this.target.collisionBox.getRectangle().center,
    );
    const startPoint = this.source.collisionBox
      .getRectangle()
      .getLineIntersectionPoint(edgeCenterLine);
    const endPoint = this.target.collisionBox
      .getRectangle()
      .getLineIntersectionPoint(edgeCenterLine);
    return new Line(startPoint, endPoint);
  }

  public rename(text: string) {
    this.text = text;
    this.adjustSizeByText();
  }

  // private _textRectangle: Rectangle = new Rectangle(Vector.getZero(), Vector.getZero());

  get textRectangle(): Rectangle {
    // HACK: 这里会造成频繁渲染，频繁计算文字宽度进而可能出现性能问题
    const textSize = getTextSize(this.text, Renderer.FONT_SIZE);
    if (this.isShifting) {
      return new Rectangle(
        this.shiftingMidPoint.subtract(textSize.divide(2)),
        textSize,
      );
    } else {
      return new Rectangle(
        this.bodyLine.midPoint().subtract(textSize.divide(2)),
        textSize,
      );
    }
    // return this._textRectangle;
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
