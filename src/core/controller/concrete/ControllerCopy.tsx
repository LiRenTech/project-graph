import { Rectangle } from "../../dataStruct/Rectangle";
import { Vector } from "../../dataStruct/Vector";
import { Node } from "../../entity/Node";
import { Renderer } from "../../render/canvas2d/renderer";
import { Stage } from "../../stage/Stage";
import { StageDumper } from "../../stage/StageDumper";
import { StageSerializedAdder } from "../../stage/stageManager/concreteMethods/StageSerializedAdder";
import { StageManager } from "../../stage/stageManager/StageManager";
import { Controller } from "../Controller";
import { ControllerClass } from "../ControllerClass";

/**
 * 关于复制相关的功能
 */
export const ControllerCopy = new ControllerClass();

const validKeys = ["ctrl", "shift", "c", "v", "x", "y"];
ControllerCopy.mousemove = (event: MouseEvent) => {
  // 移动时候
  if (Stage.copyBoardDataRectangle) {
    // 计算鼠标位置的偏移量
    const worldLocation = Renderer.transformView2World(
      new Vector(event.clientX, event.clientY),
    );
    const offset = new Vector(
      worldLocation.x - Stage.copyBoardDataRectangle.center.x,
      worldLocation.y - Stage.copyBoardDataRectangle.center.y,
    );
    Stage.copyBoardMouseVector = offset;
  }
};
ControllerCopy.keydown = (event: KeyboardEvent) => {
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

    const serialized = StageDumper.dumpSelected(nodes);
    // 复制到剪贴板
    Stage.copyBoardData = serialized;
    if (nodes.length === 0) {
      // 如果没有选中东西
      Stage.copyBoardDataRectangle = null;
    } else {
      // 复制的那一刹那，还要记录一下整个外接矩形
      const clipboardRect = Rectangle.getBoundingRectangle(
        Stage.copyBoardData.nodes.map(
          (node) =>
            new Rectangle(
              new Vector(...node.location),
              new Vector(...node.size),
            ),
        ),
      );
      Stage.copyBoardDataRectangle = clipboardRect;
    }
  } else if (key === "v" && Controller.pressingKeySet.has("control")) {
    // 粘贴

    if (Controller.pressingKeySet.has("shift")) {
      // 原位置粘贴
      StageSerializedAdder.addSerializedData(Stage.copyBoardData);
    } else {
      // 鼠标位置粘贴
      StageSerializedAdder.addSerializedData(
        Stage.copyBoardData,
        Stage.copyBoardMouseVector,
      );
    }
  }
};
