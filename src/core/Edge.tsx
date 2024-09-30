import { Serialized } from "../types/node";
import { Node } from "./Node";

export class Edge {
  source: Node;
  target: Node;
  text: string;

  constructor(
    { source, target, text }: Serialized.Edge,
    public unknown = false,
  ) {
    this.source = new Node({ uuid: source }, true);
    this.target = new Node({ uuid: target }, true);
    this.text = text;
  }
}
