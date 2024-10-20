import { Serialized } from "../../../types/node";
import { getTextSize } from "../../../utils/font";
import { Line } from "../../dataStruct/shape/Line";
import { TextNode } from "../entity/TextNode";
import { Rectangle } from "../../dataStruct/shape/Rectangle";
import { Renderer } from "../../render/canvas2d/renderer";
import { Vector } from "../../dataStruct/Vector";
import { Controller } from "../../controller/Controller";
import { Circle } from "../../dataStruct/shape/Circle";
import { StageManager } from "../../stage/stageManager/StageManager";

export class Edge {
  source: TextNode;
  target: TextNode;
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

  constructor(
    { source, target, text }: Serialized.Edge,
    /** true表示解析状态，false表示解析完毕 */
    public unknown = false,
  ) {
    this.source = new TextNode({ uuid: source }, true);
    this.target = new TextNode({ uuid: target }, true);
    this.text = text;
    this.adjustSizeByText();
  }
  /**
   * 用于鼠标右键创建线段
   * @param source
   * @param target
   */
  static fromToNode(source: TextNode, target: TextNode): Edge {
    return new Edge({ source: source.uuid, target: target.uuid, text: "" });
  }

  /**
   * 获取身体的碰撞箱
   * 这个碰撞箱是贯穿两个节点的线段
   */
  get bodyLine(): Line {
    const edgeCenterLine = new Line(
      this.source.rectangle.center,
      this.target.rectangle.center,
    );
    const startPoint =
      this.source.rectangle.getLineIntersectionPoint(edgeCenterLine);
    const endPoint =
      this.target.rectangle.getLineIntersectionPoint(edgeCenterLine);
    return new Line(startPoint, endPoint);
  }

  /**
   * 用于碰撞箱框选
   * @param rectangle
   */
  isBodyLineIntersectWithRectangle(rectangle: Rectangle): boolean {
    return rectangle.isCollideWithLine(this.bodyLine);
  }

  /**
   * 用于鼠标悬浮在线上的时候
   * @param location
   * @returns
   */
  isBodyLineIntersectWithLocation(location: Vector): boolean {
    if (this.source.uuid === this.target.uuid) {
      return new Circle(
        this.source.rectangle.location,
        this.source.rectangle.size.y / 2,
      ).isPointIn(location);
    } else {
      return this.bodyLine.isPointNearLine(
        location,
        Controller.edgeHoverTolerance,
      );
    }
  }

  /**
   * 用于线段框选
   * @param line
   * @returns
   */
  isBodyLineIntersectWithLine(line: Line): boolean {
    if (this.source.uuid === this.target.uuid) {
      // 是一个自环
      const circle = new Circle(
        this.source.rectangle.location,
        this.source.rectangle.size.y / 2,
      );
      return circle.isPointIn(line.start) || circle.isPointIn(line.end);
    } else {
      return this.bodyLine.isIntersecting(line);
    }
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
