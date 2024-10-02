import { Serialized } from "../types/node";
import { Node } from "./Node";

export class Edge {
  source: Node;
  target: Node;
  /**
   * 线段上的文字
   */
  text: string;

  constructor(
    { source, target, text }: Serialized.Edge,
    /** true表示解析状态，false表示解析完毕 */
    public unknown = false,
  ) {
    this.source = new Node({ uuid: source }, true);
    this.target = new Node({ uuid: target }, true);
    this.text = text;
  }
  /**
   * 用于鼠标右键创建线段
   * @param source
   * @param target
   */
  static fromToNode(source: Node, target: Node): Edge {
    return new Edge({ source: source.uuid, target: target.uuid, text: "" });
  }
}
