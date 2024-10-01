import { Serialized } from "../types/node";
import { Rectangle } from "./Rectangle";
import { Vector } from "./Vector";

export class Node {
  uuid: string;
  text: string;
  details: string;
  children: Node[];
  rectangle: Rectangle;

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
    this.rectangle = new Rectangle(
      new Vector(...shape.location),
      new Vector(...shape.size),
    );
  }
}
