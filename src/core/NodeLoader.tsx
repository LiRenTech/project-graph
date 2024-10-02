import { Serialized } from "../types/node";

/**
 * 这里命名不太严谨
 * NodeLoader 以为只有节点，实际上是整个舞台的序列化转换。也包含了边
 * 可能叫StageLoader更合适?
 */
export namespace NodeLoader {
  export function validate(data: Record<string, any>): Serialized.File {
    data = convertV1toV2(data);
    data = convertV2toV3(data);
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
}
