export namespace Serialized {
  export type Location = [number, number];
  export type Shape = {
    type: "Rectangle";
    location: Location;
    width: number;
    height: number;
  };
  export type Node = {
    body_shape: Shape;
    inner_text: string;
    details: string;
    uuid: string;
    children: string[];
  };
  export type Link = {
    source_node: string;
    target_node: string;
    inner_text: string;
  };
  export type File = {
    version: 2;
    nodes: Node[];
    links: Link[];
  };
}
