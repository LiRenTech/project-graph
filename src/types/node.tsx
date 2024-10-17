export namespace Serialized {
  export type Vector = [number, number];
  export type Color = [number, number, number, number];
  export type Node = {
    location: Vector;
    size: Vector;
    text: string;
    details: string;
    uuid: string;
    // children: string[];
    color: Color;
  };
  export type Edge = {
    source: string;
    target: string;
    text: string;
  };
  export type File = {
    version: 6;  // 最新版本 src\core\stage\StageDumper.tsx latestVersion
    nodes: Node[];
    edges: Edge[];
  };
}
