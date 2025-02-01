import { v4 as uuidv4 } from "uuid";
import { Serialized } from "../../../../types/node";
import { Vector } from "../../../dataStruct/Vector";
import { LineEdge } from "../../stageObject/association/LineEdge";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";
import { TextNode } from "../../stageObject/entity/TextNode";
import { StageManager } from "../StageManager";
import { Section } from "../../stageObject/entity/Section";
/**
 * 直接向舞台中添加序列化数据
 * 用于向舞台中附加新文件图、或者用于复制粘贴、甚至撤销
 */
export namespace StageSerializedAdder {
  /**
   * 将一个序列化信息加入舞台中
   * 会自动刷新新增部分的uuid
   * @param serializedData
   */
  export function addSerializedData(serializedData: Serialized.File, diffLocation = new Vector(0, 0)) {
    const updatedSerializedData = refreshUUID(serializedData);
    console.log("updatedSerializedData", updatedSerializedData);
    for (const entity of updatedSerializedData.entities) {
      if (entity.type === "core:text_node") {
        const newNode = new TextNode(entity);
        newNode.moveTo(newNode.rectangle.location.add(diffLocation));
        StageManager.addTextNode(newNode);
      } else if (entity.type === "core:section") {
        const section = new Section(entity);
        section.moveTo(section.rectangle.location.add(diffLocation));
        StageManager.addSection(section);
      } else if (entity.type === "core:connect_point") {
        const point = new ConnectPoint(entity);
        point.moveTo(point.geometryCenter.add(diffLocation));
        StageManager.addConnectPoint(point);
      }
    }
    for (const edge of updatedSerializedData.associations) {
      if (edge.type === "core:line_edge") {
        StageManager.addLineEdge(new LineEdge(edge));
      } else if (edge.type === "core:cublic_catmull_rom_spline_edge") {
        // TODO:
      }
    }
    StageManager.updateReferences();
  }

  function refreshUUID(serializedData: Serialized.File): Serialized.File {
    // 先深拷贝一份数据
    const result: Serialized.File = JSON.parse(JSON.stringify(serializedData));
    // 刷新实体UUID
    for (const entity of result.entities) {
      const oldUUID = entity.uuid;
      const newUUID = uuidv4();
      // 把这个实体所涉及的所有有向边对应的target和source的UUID也刷新
      for (const edge of result.associations) {
        if (edge.type === "core:line_edge" || edge.type === "core:cublic_catmull_rom_spline_edge") {
          if (edge.source === oldUUID) {
            edge.source = newUUID;
          }
          if (edge.target === oldUUID) {
            edge.target = newUUID;
          }
        }
      }
      // 把这个实体所涉及的所有Section父子关系的UUID也刷新
      // 具体来说就是找到这个节点的父Section，把父Section的children数组中这个节点的UUID替换成新UUID
      for (const section of result.entities) {
        if (section.type === "core:section") {
          if (section.children.includes(oldUUID)) {
            section.children = section.children.map((child) => (child === oldUUID ? newUUID : child));
          }
        }
      }

      // 刷新节点本身的UUID
      entity.uuid = newUUID;
    }

    // 刷新边的UUID
    for (const edge of result.associations) {
      edge.uuid = uuidv4();
      // HACK: 以后出了关系的关系，就要再分类了
    }
    return result;
  }
}
