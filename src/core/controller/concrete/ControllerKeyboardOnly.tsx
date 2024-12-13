import { Vector } from "../../dataStruct/Vector";
import { TextRiseEffect } from "../../effect/concrete/TextRiseEffect";
import { Stage } from "../../stage/Stage";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ControllerClass } from "../ControllerClass";
import { TextNode } from "../../stageObject/entity/TextNode";
import { editNode } from "./utilsControl";

/**
 * 纯键盘操作的控制器
 *
 * 这个功能的理想是：解决右手不停的在键盘和鼠标上来回切换的麻烦，只用键盘操作就能完成几乎所有操作。
 */
export const ControllerKeyboardOnly = new ControllerClass();

const validKeys = [
  "tab",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "enter",
  "escape",
];

ControllerKeyboardOnly.keydown = async (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  // 首先判断是否是合法的按键
  if (!validKeys.includes(key)) return;

  // 确保只有一个节点被选中
  const selectCount = StageManager.getTextNodes().filter(
    (node) => node.isSelected,
  ).length;

  if (key === "tab") {
    if (StageManager.getTextNodes().length === 0) {
      StageManager.addTextNodeByClick(Vector.getZero(), []);
      StageManager.getTextNodes()[0].isSelected = true;
    } else {
      // 开始生长节点

      // 确保只有一个节点被选中
      const selectCount = StageManager.getTextNodes().filter(
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
        const selectedNode = StageManager.getTextNodes().find(
          (node) => node.isSelected,
        );
        if (!selectedNode) return;

        if (Stage.isVirtualNewNodeShow) {
          // 将虚拟变成现实
          const location = Stage.keyOnlyVirtualNewLocation;
          const newNodeUUID = await StageManager.addTextNodeByClick(
            location,
            [],
          );

          const newNode = StageManager.getTextNodeByUUID(newNodeUUID);
          if (!newNode) return;

          StageManager.connectEntity(selectedNode, newNode);
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
  } else if (key === "escape") {
    if (Stage.isVirtualNewNodeShow) {
      Stage.isVirtualNewNodeShow = false;
    }
  } else if (key === "enter") {
    // 编辑节点
    if (selectCount === 0) {
      // 没有选中节点
    } else if (selectCount > 1) {
      // 多选中节点
      // 只选中选中节点中的其中一个节点
    } else {
      const selectedNode = StageManager.getTextNodes().find(
        (node) => node.isSelected,
      );
      if (!selectedNode) return;
      // 编辑节点
      editNode(selectedNode);
    }
  } else {
    // 移动框
    if (Stage.isVirtualNewNodeShow) {
      // 在正在准备按Tab的地方按了移动
      // Stage.isVirtualNewNodeShow = false;
      // 改变准备生长的方向
      if (key === "arrowup") {
        Stage.keyOnlyVirtualNewLocation = Stage.keyOnlyVirtualNewLocation.add(
          new Vector(0, -100),
        );
      } else if (key === "arrowdown") {
        Stage.keyOnlyVirtualNewLocation = Stage.keyOnlyVirtualNewLocation.add(
          new Vector(0, 100),
        );
      } else if (key === "arrowleft") {
        Stage.keyOnlyVirtualNewLocation = Stage.keyOnlyVirtualNewLocation.add(
          new Vector(-100, 0),
        );
      } else if (key === "arrowright") {
        Stage.keyOnlyVirtualNewLocation = Stage.keyOnlyVirtualNewLocation.add(
          new Vector(100, 0),
        );
      }
      return;
    }

    if (selectCount === 0) {
      // 没有选中节点
      // 随便选中一个节点
      if (StageManager.getTextNodes().length > 0) {
        StageManager.getTextNodes()[0].isSelected = true;
      } else {
        Stage.effects.push(new TextRiseEffect("请先添加节点"));
      }
      return;
    } else if (selectCount > 1) {
      // 多选中节点
      // 只选中选中节点中的其中一个节点
      const nodes = StageManager.getTextNodes().filter(
        (node) => node.isSelected,
      );
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].isSelected = false;
      }
      nodes[0].isSelected = true;
    } else {
      // 单选中节点
      // 开始移动框选框
      // （总是有反直觉的地方）
      const selectedNode = StageManager.getTextNodes().find(
        (node) => node.isSelected,
      );
      if (!selectedNode) return;

      if (key === "arrowup") {
        // 在节点上方查找所有节点，并选中距离上方最近的一个
        const newSelectedNode = getMostBottomNode(
          getRelatedNodes(selectedNode).filter(
            (node: TextNode) =>
              node.rectangle.center.y < selectedNode.rectangle.center.y,
          ),
        );

        if (newSelectedNode) {
          selectedNode.isSelected = false;
          newSelectedNode.isSelected = true;
        }
      } else if (key === "arrowdown") {
        // 在节点下方查找所有节点，并选中距离下方最近的一个
        const newSelectedNode = getMostTopNode(
          getRelatedNodes(selectedNode).filter(
            (node: TextNode) =>
              node.rectangle.center.y > selectedNode.rectangle.center.y,
          ),
        );

        if (newSelectedNode) {
          selectedNode.isSelected = false;
          newSelectedNode.isSelected = true;
        }
      } else if (key === "arrowleft") {
        // 在节点左侧查找所有节点，并选中距离左侧最近的一个
        const newSelectedNode = getMostRightNode(
          getRelatedNodes(selectedNode).filter(
            (node: TextNode) =>
              node.rectangle.center.x < selectedNode.rectangle.center.x,
          ),
        );

        if (newSelectedNode) {
          selectedNode.isSelected = false;
          newSelectedNode.isSelected = true;
        }
      } else if (key === "arrowright") {
        // 在节点右侧查找所有节点，并选中距离右侧最近的一个
        const newSelectedNode = getMostLeftNode(
          getRelatedNodes(selectedNode).filter(
            (node: TextNode) =>
              node.rectangle.center.x > selectedNode.rectangle.center.x,
          ),
        );

        if (newSelectedNode) {
          selectedNode.isSelected = false;
          newSelectedNode.isSelected = true;
        }
      }
    }
  }
};

/**
 * 根据一个节点，获取其连线相关的所有节点
 * 包括所有第一层孩子节点和第一层父亲节点
 */
function getRelatedNodes(node: TextNode): TextNode[] {
  const relatedNodes: TextNode[] = [];
  // 获取所有孩子节点
  for (const edge of StageManager.getEdges()) {
    if (edge.source.uuid === node.uuid) {
      const childNode = StageManager.getTextNodeByUUID(edge.target.uuid);
      if (childNode) relatedNodes.push(childNode);
    }
  }

  // 获取所有连向它的
  for (const edge of StageManager.getEdges()) {
    if (edge.target.uuid === node.uuid) {
      const fatherNode = StageManager.getTextNodeByUUID(edge.source.uuid);
      if (fatherNode) relatedNodes.push(fatherNode);
    }
  }
  return relatedNodes;
}

/**
 * 获取一堆节点中，最左边的节点
 * @param nodes
 */
function getMostLeftNode(nodes: TextNode[]): TextNode | null {
  if (nodes.length === 0) return null;
  let mostLeftNode = nodes[0];
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i].rectangle.center.x < mostLeftNode.rectangle.center.x) {
      mostLeftNode = nodes[i];
    }
  }
  return mostLeftNode;
}

/**
 * 获取一堆节点中，最右边的节点
 * @param nodes
 */
function getMostRightNode(nodes: TextNode[]): TextNode | null {
  if (nodes.length === 0) return null;
  let mostRightNode = nodes[0];
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i].rectangle.center.x > mostRightNode.rectangle.center.x) {
      mostRightNode = nodes[i];
    }
  }
  return mostRightNode;
}

/**
 * 获取一堆节点中，最上边的节点
 * @param nodes
 */
function getMostTopNode(nodes: TextNode[]): TextNode | null {
  if (nodes.length === 0) return null;
  let mostTopNode = nodes[0];
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i].rectangle.center.y < mostTopNode.rectangle.center.y) {
      mostTopNode = nodes[i];
    }
  }
  return mostTopNode;
}

/**
 * 获取一堆节点中，最下边的节点
 * @param nodes
 */
function getMostBottomNode(nodes: TextNode[]): TextNode | null {
  if (nodes.length === 0) return null;
  let mostBottomNode = nodes[0];
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i].rectangle.center.y > mostBottomNode.rectangle.center.y) {
      mostBottomNode = nodes[i];
    }
  }
  return mostBottomNode;
}
