import { StageDumper } from "../core/stage/StageDumper";

// version 在 StageDumper里
export namespace Serialized {
  export type Vector = [number, number];
  export type Color = [number, number, number, number];

  export type StageObject = {
    uuid: string;
    type: string;
  };

  export type Entity = StageObject & {
    location: Vector;
    details: string;
  };

  export type TextNode = Entity & {
    type: "core:text_node";
    size: Vector;
    text: string;
    color: Color;
  };

  export function isTextNode(obj: StageObject): obj is TextNode {
    return obj.type === "core:text_node";
  }

  export type Section = Entity & {
    type: "core:section";
    size: Vector;
    text: string;
    color: Color;

    children: string[]; // uuid[]
    isHidden: boolean;
    isCollapsed: boolean;
  };

  export function isSection(obj: StageObject): obj is Section {
    return obj.type === "core:section";
  }

  export type ConnectPoint = Entity & {
    type: "core:connect_point";
  };
  export function isConnectPoint(obj: StageObject): obj is ConnectPoint {
    return obj.type === "core:connect_point";
  }
  export type ImageNode = Entity & {
    path: string;
    size: Vector;
    scale: number;
    type: "core:image_node";
  };
  export function isImageNode(obj: StageObject): obj is ImageNode {
    return obj.type === "core:image_node";
  }
  export type UrlNode = Entity & {
    url: string;
    title: string;
    size: Vector;
    color: Color;
    type: "core:url_node";
  };
  export function isUrlNode(obj: StageObject): obj is UrlNode {
    return obj.type === "core:url_node";
  }
  export type PortalNode = Entity & {
    // 连接的文件
    portalFilePath: string;
    targetLocation: Vector;
    cameraScale: number;
    // 显示的可更改标题
    title: string;
    // 传送门的大小
    size: Vector;
    // 颜色
    color: Color;
    type: "core:portal_node";
  };
  export function isPortalNode(obj: StageObject): obj is PortalNode {
    return obj.type === "core:portal_node";
  }
  export type PenStroke = Entity & {
    type: "core:pen_stroke";
    content: string;
    color: Color;
  };
  export function isPenStroke(obj: StageObject): obj is PenStroke {
    return obj.type === "core:pen_stroke";
  }
  // export type Edge = StageObject & {
  //   type: "core:edge";
  //   source: string;
  //   target: string;
  //   text: string;
  // };
  export type Association = StageObject & {
    text: string;
  };
  export type Edge = Association & {
    source: string;
    target: string;
  };
  export type LineEdge = Edge & {
    type: "core:line_edge";
    color: Color;
    text: string;
  };
  export function isLineEdge(obj: StageObject): obj is LineEdge {
    return obj.type === "core:line_edge";
  }
  export function isCublicCatmullRomSplineEdge(obj: StageObject): obj is CublicCatmullRomSplineEdge {
    return obj.type === "core:cublic_catmull_rom_spline_edge";
  }
  export type CublicCatmullRomSplineEdge = Edge & {
    type: "core:cublic_catmull_rom_spline_edge";
    text: string;
    controlPoints: Vector[];
    alpha: number;
    tension: number;
  };

  export type File = {
    version: typeof StageDumper.latestVersion;
    entities: (TextNode | Section | ConnectPoint | ImageNode | UrlNode | PenStroke | PortalNode)[];
    associations: (LineEdge | CublicCatmullRomSplineEdge)[];
    tags: string[];
  };
}
