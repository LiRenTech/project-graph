import { Serialized } from "../../types/node";
import { getTextSize } from "../../utils/font";
import { Line } from "../dataStruct/Line";
import { Node } from "./Node";
import { Rectangle } from "../dataStruct/Rectangle";
import { Renderer } from "../render/canvas2d/renderer";

export class Edge {
  source: Node;
  target: Node;
  /**
   * 线段上的文字
   */
  text: string;

  /**
   * 是否被选中
   */
  isSelected: boolean = false;

  constructor(
    { source, target, text }: Serialized.Edge,
    /** true表示解析状态，false表示解析完毕 */
    public unknown = false,
  ) {
    this.source = new Node({ uuid: source }, true);
    this.target = new Node({ uuid: target }, true);
    this.text = text;
    this.adjustSizeByText();
  }
  /**
   * 用于鼠标右键创建线段
   * @param source
   * @param target
   */
  static fromToNode(source: Node, target: Node): Edge {
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
