import { Serialized } from "../../../../types/node";
import { Vector } from "../../../dataStruct/Vector";
import { Edge } from "../../../stageObject/association/Edge";
import { TextNode } from "../../../stageObject/entity/TextNode";
import { StageManager } from "../StageManager";
import { v4 as uuidv4 } from "uuid";
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
    for (const node of updatedSerializedData.nodes) {
      const newNode = new TextNode(node);
      newNode.moveTo(newNode.rectangle.location.add(diffLocation));
      StageManager.addTextNode(newNode);
    }
    for (const edge of updatedSerializedData.edges) {
      StageManager.addEdge(new Edge(edge));
    }
    StageManager.updateReferences();
  }

  function refreshUUID(serializedData: Serialized.File): Serialized.File {
    // 先深拷贝一份数据
    const result: Serialized.File = JSON.parse(JSON.stringify(serializedData));
    // 刷新UUID
    for (const node of result.nodes) {
      const oldUUID = node.uuid;
      const newUUID = uuidv4();
      for (const edge of result.edges) {
        if (edge.source === oldUUID) {
          edge.source = newUUID;
        }
        if (edge.target === oldUUID) {
          edge.target = newUUID;
        }
      }

      // 刷新节点本身的UUID
      node.uuid = newUUID;
    }
    return result;
  }
}
