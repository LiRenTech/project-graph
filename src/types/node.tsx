export namespace Serialized {
  export type Vector = [number, number];
  export type Shape = {
    type: "Rectangle";
    location: Vector;
    size: Vector;
  };
  export type Node = {
    shape: Shape;
    text: string;
    details: string;
    uuid: string;
    children: string[];
    isColorSetByUser: boolean;
    userColor: number[];
  };
  export type Edge = {
    source: string;
    target: string;
    text: string;
  };
  export type File = {
    version: 3;
    nodes: Node[];
    edges: Edge[];
  };
}
