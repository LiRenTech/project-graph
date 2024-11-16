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
    type: "core:text_node";
    size: Vector;
    text: string;
    color: Color;

    details: string;
  };

  export type Section = Entity & {
    type: "core:section";
    size: Vector;
    text: string;
    color: Color;

    children: string[];  // uuid[]
    isHidden: boolean;
    isCollapsed: boolean;
  };

  export type ConnectPoint = Entity & {
    type: "core:connect_point";
  }
  export type ImageNode = Entity & {
    path: string;
    size: Vector;
    type: "core:image_node";
  }
  export type Edge = StageObject & {
    type: "core:edge";
    source: string;
    target: string;
    text: string;
  };

  export type File = {
    version: 9;  // 最新版本 src\core\stage\StageDumper.tsx latestVersion
    nodes: (Node | Section | ConnectPoint | ImageNode)[];
    edges: Edge[];
  };
}
