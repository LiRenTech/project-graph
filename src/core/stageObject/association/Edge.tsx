import { Serialized } from "../../../types/node";
import { getTextSize } from "../../../utils/font";
import { Line } from "../../dataStruct/shape/Line";
import { TextNode } from "../entity/TextNode";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Renderer } from "../../render/canvas2d/renderer";
import { Vector } from "../../dataStruct/Vector";
import { Circle } from "../../dataStruct/shape/Circle";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ConnectableAssociation, ConnectableEntity } from "../StageObject";
import { CollisionBox } from "../collisionBox/collisionBox";
import { v4 as uuidv4 } from "uuid";

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
    if (this.source.uuid === this.target.uuid) {
      // 是一个自环，碰撞箱是圆形
      return new CollisionBox([
        new Circle(
          this.source.collisionBox.getRectangle().location,
          this.source.collisionBox.getRectangle().size.y / 2,
        ),
      ]);
    } else {
      return new CollisionBox([this.bodyLine]);
    }
  }

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
    const startPoint =
      this.source.collisionBox.getRectangle().getLineIntersectionPoint(edgeCenterLine);
    const endPoint =
      this.target.collisionBox.getRectangle().getLineIntersectionPoint(edgeCenterLine);
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

  get textRectangle(): Rectangle {
    const textSize = getTextSize(this.text, Renderer.FONT_SIZE);

    return new Rectangle(
      this.bodyLine.midPoint().subtract(textSize.divide(2)),
      textSize,
    );
  }

  /**
   * 调整线段上的文字的外框矩形
   */
  adjustSizeByText() {}
}
