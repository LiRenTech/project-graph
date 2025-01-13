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

  export type Node = Entity & {
    type: "core:text_node";
    size: Vector;
    text: string;
    color: Color;
  };

  export type Section = Entity & {
    type: "core:section";
    size: Vector;
    text: string;
    color: Color;

    children: string[]; // uuid[]
    isHidden: boolean;
    isCollapsed: boolean;
  };

  export type ConnectPoint = Entity & {
    type: "core:connect_point";
  };
  export type ImageNode = Entity & {
    path: string;
    size: Vector;
    scale: number;
    type: "core:image_node";
  };
  export type UrlNode = Entity & {
    url: string;
    title: string;
    size: Vector;
    color: Color;
    type: "core:url_node";
  };
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
    text: string;
  };
  export type CublicCatmullRomSplineEdge = Edge & {
    type: "core:cublic_catmull_rom_spline_edge";
    text: string;
    controlPoints: Vector[];
    alpha: number;
    tension: number;
  };

  export type File = {
    version: typeof StageDumper.latestVersion;
    entities: (Node | Section | ConnectPoint | ImageNode | UrlNode)[];
    associations: (LineEdge | CublicCatmullRomSplineEdge)[];
    tags: string[];
  };
}
