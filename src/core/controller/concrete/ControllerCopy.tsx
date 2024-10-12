import { Node } from "../../Node";
import { Stage } from "../../stage/Stage";
import { StageDumper } from "../../stage/StageDumper";
import { StageSerializedAdder } from "../../stage/stageManager/concreteMethods/StageSerializedAdder";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";
import { ControllerKeyboardOnly } from "./ControllerKeyboardOnly";

/**
 * 关于复制相关的功能
 */
export const ControllerCopy = new ControllerClass();

const validKeys = ["ctrl", "shift", "alt", "c", "v", "x", "y"];

ControllerKeyboardOnly.keydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  // 首先判断是否是合法的按键
  if (!validKeys.includes(key)) return;

  if (key === "c" && Controller.pressingKeySet.has("control")) {

    // 复制
    const nodes: Node[] = [];
    for (const node of StageManager.nodes) {
      if (node.isSelected) {
        nodes.push(node);
      }
    }
    // 如果没有选中东西，则不覆盖原来的复制板数据
    if (nodes.length === 0) return;

    const serialized = StageDumper.dumpSelected(nodes);
    // 复制到剪贴板
    Stage.copyBoardData = serialized;

  } else if (key === "v" && Controller.pressingKeySet.has("control")) {
    // 粘贴

    if (Controller.pressingKeySet.has("shift")) {
      // 原位置粘贴
      StageSerializedAdder.addSerializedData(Stage.copyBoardData);
      console.log("原位置粘贴");
    } else {
      // 鼠标位置粘贴
      console.log("paste");
    }
  }
};
