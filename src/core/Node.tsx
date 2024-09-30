import { Serialized } from "../types/node";
import { Vector } from "./Vector";

export class Node {
  uuid: string;
  text: string;
  details: string;
  children: Node[];
  location: Vector;
  size: Vector;

  constructor(
    {
      uuid,
      text = "",
      details = "",
      children = [],
      shape = { type: "Rectangle", location: [0, 0], size: [0, 0] },
    }: Partial<Serialized.Node> & { uuid: string },
    public unknown = false,
  ) {
    this.uuid = uuid;
    this.text = text;
    this.details = details;
    this.children = children.map(
      (childUUID) => new Node({ uuid: childUUID }, true),
    );
    this.location = new Vector(...shape.location);
    this.size = new Vector(...shape.size);
  }
}
