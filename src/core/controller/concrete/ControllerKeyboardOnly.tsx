import { Vector } from "../../dataStruct/Vector";
import { TextRiseEffect } from "../../effect/concrete/TextRiseEffect";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ControllerClass } from "../ControllerClass";
import { Node } from "../../Node";

/**
 * 纯键盘操作的控制器
 *
 * 这个功能的理想是：解决右手不停的在键盘和鼠标上来回切换的麻烦，只用键盘操作就能完成所有操作。
 */
export const ControllerKeyboardOnly = new ControllerClass();

const validKeys = ["tab", "arrowup", "arrowdown", "arrowleft", "arrowright"];

ControllerKeyboardOnly.keydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  // 首先判断是否是合法的按键
  if (!validKeys.includes(key)) return;

  // 确保只有一个节点被选中
  const selectCount = StageManager.nodes.filter(
    (node) => node.isSelected,
  ).length;

  if (key === "tab") {
    if (StageManager.nodes.length === 0) {
      StageManager.addNodeByClick(Vector.getZero());
      StageManager.nodes[0].isSelected = true;
    } else {
      // 开始生长节点

      // 确保只有一个节点被选中
      const selectCount = StageManager.nodes.filter(
        (node) => node.isSelected,
      ).length;

      if (selectCount === 0) {
        Stage.effects.push(
          new TextRiseEffect("请先按上下左右方向键选择一个节点"),
        );
      } else if (selectCount > 1) {
        Stage.effects.push(
          new TextRiseEffect("请先按方向键，确保只选择一个节点"),
        );
      } else {
        // 连线
        const selectedNode = StageManager.nodes.find((node) => node.isSelected);
        if (!selectedNode) return;

        if (Stage.isVirtualNewNodeShow) {
          // 将虚拟变成现实
          const location = Stage.keyOnlyVirtualNewLocation;
          const newNodeUUID = StageManager.addNodeByClick(location);

          const newNode = StageManager.getNodeByUUID(newNodeUUID);
          if (!newNode) return;

          StageManager.connectNode(selectedNode, newNode);
          Stage.isVirtualNewNodeShow = false;
          return;
        } else {
          // 只有一个节点被选中了
          Stage.isVirtualNewNodeShow = true;
          Stage.keyOnlyVirtualNewLocation = selectedNode.rectangle.center.add(
            new Vector(100, 0),
          );

          // 按下后会有一个虚拟框，再次按下tab才会生长节点
        }
      }
    }
  } else {
    // 移动框

    if (selectCount === 0) {
      // 没有选中节点
      // 随便选中一个节点
      if (StageManager.nodes.length > 0) {
        StageManager.nodes[0].isSelected = true;
      } else {
        Stage.effects.push(new TextRiseEffect("请先添加节点"));
      }
      return;
    } else if (selectCount > 1) {
      // 多选中节点
      // 只选中选中节点中的其中一个节点
      const nodes = StageManager.nodes.filter((node) => node.isSelected);
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].isSelected = false;
      }
      nodes[0].isSelected = true;
    } else {
      // 单选中节点
      // 开始移动框选框
      const selectedNode = StageManager.nodes.find((node) => node.isSelected);
      if (!selectedNode) return;

      if (key === "arrowup") {
        // 在节点上方查找所有节点，并选中距离上方最近的一个
        const nodes = StageManager.nodes
          .filter(
            (node: Node) =>
              node.rectangle.center.y < selectedNode.rectangle.center.y,
          )
          .sort((a, b) => b.rectangle.center.y - a.rectangle.center.y);
        if (nodes.length > 0) {
          selectedNode.isSelected = false;
          nodes[0].isSelected = true;
        }
      } else if (key === "arrowdown") {
        // 在节点下方查找所有节点，并选中距离下方最近的一个
        const nodes = StageManager.nodes
          .filter(
            (node: Node) =>
              node.rectangle.center.y > selectedNode.rectangle.center.y,
          )
          .sort((a, b) => a.rectangle.center.y - b.rectangle.center.y);
        if (nodes.length > 0) {
          selectedNode.isSelected = false;
          nodes[0].isSelected = true;
        }
      } else if (key === "arrowleft") {
        // 在节点左侧查找所有节点，并选中距离左侧最近的一个
        const nodes = StageManager.nodes
          .filter(
            (node: Node) =>
              node.rectangle.center.x < selectedNode.rectangle.center.x,
          )
          .sort((a, b) => b.rectangle.center.x - a.rectangle.center.x);
        if (nodes.length > 0) {
          selectedNode.isSelected = false;
          nodes[0].isSelected = true;
        }
      } else if (key === "arrowright") {
        // 在节点右侧查找所有节点，并选中距离右侧最近的一个
        const nodes = StageManager.nodes
          .filter(
            (node: Node) =>
              node.rectangle.center.x > selectedNode.rectangle.center.x,
          )
          .sort((a, b) => a.rectangle.center.x - b.rectangle.center.x);
        if (nodes.length > 0) {
          selectedNode.isSelected = false;
          nodes[0].isSelected = true;
        }
      }
    }
  }
};

ControllerKeyboardOnly.keyup = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  console.log(key);
};
