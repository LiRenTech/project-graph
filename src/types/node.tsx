export namespace Serialized {
  export type Vector = [number, number];
  export type Color = [number, number, number, number];

  export type StageObject = {
    uuid: string;
    type: string;
  }

  export type Entity = StageObject & {
    location: Vector;
  }

  export type Node = Entity & {
    size: Vector;
    text: string;
    details: string;
    color: Color;
    type: "core:text_node";
  };

  export type Section = Entity & {
    size: Vector;
    text: string;
    color: Color;
    type: "core:section";
  };

  export type Edge = StageObject & {
    source: string;
    target: string;
    text: string;
    uuid: string;
    type: "core:edge";
  };
  export type File = {
    version: 8;  // 最新版本 src\core\stage\StageDumper.tsx latestVersion
    nodes: (Node | Section)[];
    edges: Edge[];
  };
}
