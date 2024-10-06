import { Vector } from "../../../dataStruct/Vector";
import { Node } from "../../../Node";
import { StageManager } from "../StageManager";
import { v4 as uuidv4 } from "uuid";

/**
 * 包含增加节点的方法
 * 有可能是用鼠标增加，涉及自动命名器
 * 也有可能是用键盘增加，涉及快捷键和自动寻找空地
 */
export namespace StageNodeAdder {
  export function addNodeByClick(clickWorldLocation: Vector) {
    const node = new Node({
      uuid: uuidv4(),
      text: "...",
      details: "",
      children: [],
      shape: {
        type: "Rectangle",
        location: [clickWorldLocation.x, clickWorldLocation.y],
        size: [100, 100],
      },
    });
    // 将node本身向左上角移动，使其居中
    node.rectangle.location = node.rectangle.location.subtract(
      node.rectangle.size.divide(2),
    );
    StageManager.addNode(node);
  }
}