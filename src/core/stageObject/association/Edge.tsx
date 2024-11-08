import { Serialized } from "../../../types/node";
import { getTextSize } from "../../../utils/font";
import { Line } from "../../dataStruct/shape/Line";
import { TextNode } from "../entity/TextNode";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Renderer } from "../../render/canvas2d/renderer";
import { Vector } from "../../dataStruct/Vector";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ConnectableAssociation, ConnectableEntity } from "../StageObject";
import { CollisionBox } from "../collisionBox/collisionBox";
import { v4 as uuidv4 } from "uuid";
import { EdgeCollisionBoxGetter } from "./EdgeCollisionBoxGetter";

export class Edge extends ConnectableAssociation {
  public uuid: string;

  /**
   * 线段上的文字
   */
  text: string;

  /**
   * 是否被选中
   */
  _isSelected: boolean = false;

  public get isSelected(): boolean {
    return this._isSelected;
  }
  public set isSelected(value: boolean) {
    const oldValue = this._isSelected;
    this._isSelected = value;
    if (oldValue !== value) {
      if (oldValue === true) {
        // 减少了一个选中节点
        StageManager.selectedEdgeCount--;
      } else {
        // 增加了一个选中节点
        StageManager.selectedEdgeCount++;
      }
    }
  }

  get source(): ConnectableEntity {
    return this._source;
  }
  set source(value: ConnectableEntity) {
    this._source = value;
  }

  get target(): ConnectableEntity {
    return this._target;
  }
  set target(value: ConnectableEntity) {
    this._target = value;
  }

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

  private _source: ConnectableEntity;
  private _target: ConnectableEntity;

  constructor(
    { source, target, text, uuid }: Serialized.Edge,
    /** true表示解析状态，false表示解析完毕 */
    public unknown = false,
  ) {
    super();
    this._source = new TextNode({ uuid: source }, true);
    this._target = new TextNode({ uuid: target }, true);
    this.text = text;
    this.uuid = uuid;
    console.log("创建了一个Edge");
    this.adjustSizeByText();
  }
  /**
   * 用于鼠标右键创建线段
   * @param source
   * @param target
   */
  static fromToNode(source: TextNode, target: TextNode): Edge {
    return new Edge({
      source: source.uuid,
      target: target.uuid,
      text: "",
      uuid: uuidv4(),
      type: "core:edge",
    });
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

  /**
   * 用于碰撞箱框选
   * @param rectangle
   */
  isBodyLineIntersectWithRectangle(rectangle: Rectangle): boolean {
    return this.collisionBox.isRectangleInCollisionBox(rectangle);
  }

  /**
   * 用于鼠标悬浮在线上的时候
   * @param location
   * @returns
   */
  isBodyLineIntersectWithLocation(location: Vector): boolean {
    return this.collisionBox.isPointInCollisionBox(location);
  }

  /**
   * 用于线段框选
   * @param line
   * @returns
   */
  isBodyLineIntersectWithLine(line: Line): boolean {
    return this.collisionBox.isLineInCollisionBox(line);
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
  /**
   * 调整线段上的文字的外框矩形
   */
  adjustSizeByText() {
    // const textSize = getTextSize(this.text, Renderer.FONT_SIZE);
    // this._textRectangle = new Rectangle(
    //   this.bodyLine.midPoint().subtract(textSize.divide(2)),
    //   textSize,
    // );
  }
}
