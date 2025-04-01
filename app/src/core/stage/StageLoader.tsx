import { Serialized } from "../../types/node";
import { v4 as uuidv4 } from "uuid";

/**
 * 舞台加载
 */
export namespace StageLoader {
  /**
   * 将序列化数据逐步的，一级一级的转换为最新版本的格式
   * 函数中将自动检测数据版本，并进行相应的转换
   * @param data json格式的序列化数据
   * @returns 最新版本的序列化数据
   */
  export function validate(data: Record<string, any>): Serialized.File {
    data = convertV1toV2(data);
    data = convertV2toV3(data);
    data = convertV3toV4(data);
    data = convertV4toV5(data);
    data = convertV5toV6(data);
    data = convertV6toV7(data);
    data = convertV7toV8(data);
    data = convertV8toV9(data);
    data = convertV9toV10(data);
    data = convertV10toV11(data);
    data = convertV11toV12(data);
    data = convertV12toV13(data);
    data = convertV13toV14(data);
    data = convertV14toV15(data);
    data = convertV15toV16(data);
    return data as Serialized.File;
  }

  function convertV1toV2(data: Record<string, any>): Record<string, any> {
    // 如果有version字段，说明数据是v2以上版本，不需要转换
    if ("version" in data) {
      return data;
    }
    data.version = 2;
    // 检查缺失的字段
    if (!("nodes" in data)) {
      data.nodes = [];
    }
    if (!("links" in data)) {
      data.links = [];
    }
    // 检查节点中缺失的字段
    for (const node of data.nodes) {
      if (!("details" in node)) {
        node.details = {};
      }
      if (!("inner_text" in node)) {
        node.inner_text = "";
      }
      if (!("children" in node)) {
        node.children = [];
      }
      if (!("uuid" in node)) {
        throw new Error("节点缺少uuid字段");
      }
    }
    for (const link of data.links) {
      if (!("inner_text" in link)) {
        link.inner_text = "";
      }
    }
    return data;
  }
  function convertV2toV3(data: Record<string, any>): Record<string, any> {
    if (data.version >= 3) {
      return data;
    }
    data.version = 3;
    // 重命名字段
    for (const node of data.nodes) {
      node.shape = node.body_shape;
      delete node.body_shape;
      node.shape.location = node.shape.location_left_top;
      delete node.shape.location_left_top;
      node.shape.size = [node.shape.width, node.shape.height];
      delete node.shape.width;
      delete node.shape.height;
      node.text = node.inner_text;
      delete node.inner_text;
    }
    data.edges = data.links;
    delete data.links;
    for (const edge of data.edges) {
      edge.source = edge.source_node;
      delete edge.source_node;
      edge.target = edge.target_node;
      delete edge.target_node;
      edge.text = edge.inner_text;
      delete edge.inner_text;
    }
    return data;
  }
  function convertV3toV4(data: Record<string, any>): Record<string, any> {
    if (data.version >= 4) {
      return data;
    }
    data.version = 4;
    for (const node of data.nodes) {
      node.color = [0, 0, 0, 0];
      node.location = node.shape.location;
      delete node.shape.location;
      node.size = node.shape.size;
      delete node.shape.size;
    }
    return data;
  }
  function convertV4toV5(data: Record<string, any>): Record<string, any> {
    if (data.version >= 5) {
      return data;
    }
    data.version = 5;
    for (const node of data.nodes) {
      if (!node.color) {
        node.color = [0, 0, 0, 0];
      }
    }
    return data;
  }

  // 继承体系重构，移除节点的 children字段
  function convertV5toV6(data: Record<string, any>): Record<string, any> {
    if (data.version >= 6) {
      return data;
    }
    data.version = 6;
    for (const node of data.nodes) {
      if (typeof node.children !== "undefined") {
        delete node.children;
      }
    }
    return data;
  }

  // 继承体系重构，Edge增加uuid字段
  function convertV6toV7(data: Record<string, any>): Record<string, any> {
    if (data.version >= 7) {
      return data;
    }
    data.version = 7;
    for (const edge of data.edges) {
      if (typeof edge.uuid === "undefined") {
        edge.uuid = uuidv4();
      }
    }
    return data;
  }

  // 继承体系重构，增加type
  function convertV7toV8(data: Record<string, any>): Record<string, any> {
    if (data.version >= 8) {
      return data;
    }
    data.version = 8;
    for (const node of data.nodes) {
      node.type = "core:text_node";
    }
    for (const edge of data.edges) {
      edge.type = "core:edge";
    }
    return data;
  }

  // 增加连接点 ConnectionPoint
  function convertV8toV9(data: Record<string, any>): Record<string, any> {
    if (data.version >= 9) {
      return data;
    }
    data.version = 9;
    return data;
  }

  // 增加tags
  function convertV9toV10(data: Record<string, any>): Record<string, any> {
    if (data.version >= 10) {
      return data;
    }
    data.version = 10;
    data.tags = [];
    return data;
  }

  // 所有实体都支持 details，不再仅仅是TextNode支持
  function convertV10toV11(data: Record<string, any>): Record<string, any> {
    if (data.version >= 11) {
      return data;
    }
    data.version = 11;
    for (const node of data.nodes) {
      if (node.type === "core:section") {
        // bug
        if (typeof node.details === "undefined") {
          node.details = "";
        }
      } else if (node.type === "core:connect_point") {
        // bug
        if (typeof node.details === "undefined") {
          node.details = "";
        }
      } else if (node.type === "core:image_node") {
        if (typeof node.details === "undefined") {
          node.details = "";
        }
      }
    }
    return data;
  }

  // 图片支持自定义缩放大小
  function convertV11toV12(data: Record<string, any>): Record<string, any> {
    if (data.version >= 12) {
      return data;
    }
    data.version = 12;
    for (const node of data.nodes) {
      if (node.type === "core:image_node") {
        if (typeof node.scale === "undefined") {
          node.scale = 1 / (window.devicePixelRatio || 1);
        }
      }
    }
    return data;
  }

  /**
   * node -> entities
   * edge -> associations
   * @param data
   * @returns
   */
  function convertV12toV13(data: Record<string, any>): Record<string, any> {
    if (data.version >= 13) {
      return data;
    }
    data.version = 13;
    if ("nodes" in data) {
      data.entities = data.nodes;
      delete data.nodes;
    }
    if ("edges" in data) {
      for (const edge of data.edges) {
        edge.type = "core:line_edge";
      }
      data.associations = data.edges;
      delete data.edges;
    }

    return data;
  }

  /**
   * Edge增加了颜色字段
   * @param data
   */
  function convertV13toV14(data: Record<string, any>): Record<string, any> {
    if (data.version >= 14) {
      return data;
    }
    data.version = 14;
    for (const edge of data.associations) {
      // edge.color = [0, 0, 0, 0];
      if (typeof edge.color === "undefined") {
        edge.color = [0, 0, 0, 0];
      }
    }
    return data;
  }

  /**
   * 涂鸦增加颜色字段
   * @param data
   */
  function convertV14toV15(data: Record<string, any>): Record<string, any> {
    if (data.version >= 15) {
      return data;
    }
    data.version = 15;
    for (const node of data.entities) {
      if (node.type === "core:pen_stroke") {
        if (typeof node.color === "undefined") {
          node.color = [0, 0, 0, 0];
        }
      }
    }
    return data;
  }

  /**
   * 文本节点增加自动转换大小/手动转换大小功能
   * @param data
   */
  function convertV15toV16(data: Record<string, any>): Record<string, any> {
    if (data.version >= 16) {
      return data;
    }
    data.version = 16;
    for (const node of data.entities) {
      if (node.type === "core:text_node") {
        if (typeof node.sizeAdjust === "undefined") {
          node.sizeAdjust = "auto";
        }
      }
    }
    return data;
  }
}
