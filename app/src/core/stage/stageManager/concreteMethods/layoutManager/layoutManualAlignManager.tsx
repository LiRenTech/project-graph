import { Vector } from "../../../../dataStruct/Vector";
import { StageHistoryManager } from "../../StageHistoryManager";
import { StageManager } from "../../StageManager";
import { StageEntityMoveManager } from "../StageEntityMoveManager";

export namespace LayoutManualAlignManager {
  // 左侧对齐
  export function alignLeft() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    const minX = Math.min(...nodes.map((node) => node.collisionBox.getRectangle().left));
    for (const node of nodes) {
      StageEntityMoveManager.moveEntityUtils(node, new Vector(minX - node.collisionBox.getRectangle().left, 0));
    }
    StageHistoryManager.recordStep();
  }

  // 右侧对齐
  export function alignRight() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    const maxX = Math.max(...nodes.map((node) => node.collisionBox.getRectangle().right));
    for (const node of nodes) {
      StageEntityMoveManager.moveEntityUtils(node, new Vector(maxX - node.collisionBox.getRectangle().right, 0));
    }
    StageHistoryManager.recordStep();
  }

  // 上侧对齐
  export function alignTop() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    const minY = Math.min(...nodes.map((node) => node.collisionBox.getRectangle().top));
    for (const node of nodes) {
      StageEntityMoveManager.moveEntityUtils(node, new Vector(0, minY - node.collisionBox.getRectangle().top));
    }
    StageHistoryManager.recordStep();
  }

  // 下侧对齐
  export function alignBottom() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    const maxY = Math.max(...nodes.map((node) => node.collisionBox.getRectangle().bottom));
    for (const node of nodes) {
      StageEntityMoveManager.moveEntityUtils(node, new Vector(0, maxY - node.collisionBox.getRectangle().bottom));
    }
    StageHistoryManager.recordStep();
  }

  export function alignCenterHorizontal() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列

    // 计算所有选中节点的总高度和最小 y 坐标
    const minY = Math.min(...nodes.map((node) => node.collisionBox.getRectangle().top));
    const maxY = Math.max(...nodes.map((node) => node.collisionBox.getRectangle().bottom));
    const totalHeight = maxY - minY;
    const centerY = minY + totalHeight / 2;

    for (const node of nodes) {
      const nodeCenterY = node.collisionBox.getRectangle().top + node.collisionBox.getRectangle().size.y / 2;
      const newY = centerY - (nodeCenterY - node.collisionBox.getRectangle().top);
      StageEntityMoveManager.moveEntityToUtils(node, new Vector(node.collisionBox.getRectangle().left, newY));
    }
    StageHistoryManager.recordStep();
  }

  export function alignCenterVertical() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列

    // 计算所有选中节点的总宽度和最小 x 坐标
    const minX = Math.min(...nodes.map((node) => node.collisionBox.getRectangle().left));
    const maxX = Math.max(...nodes.map((node) => node.collisionBox.getRectangle().right));
    const totalWidth = maxX - minX;
    const centerX = minX + totalWidth / 2;

    for (const node of nodes) {
      const nodeCenterX = node.collisionBox.getRectangle().left + node.collisionBox.getRectangle().size.x / 2;
      const newX = centerX - (nodeCenterX - node.collisionBox.getRectangle().left);
      StageEntityMoveManager.moveEntityToUtils(node, new Vector(newX, node.collisionBox.getRectangle().top));
    }
    StageHistoryManager.recordStep();
  }

  // 相等间距水平分布对齐
  export function alignHorizontalSpaceBetween() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列

    const minX = Math.min(...nodes.map((node) => node.collisionBox.getRectangle().left));
    const maxX = Math.max(...nodes.map((node) => node.collisionBox.getRectangle().right));
    const totalWidth = maxX - minX;
    const totalNodesWidth = nodes.reduce((sum, node) => sum + node.collisionBox.getRectangle().size.x, 0);
    const availableSpace = totalWidth - totalNodesWidth;
    const spaceBetween = nodes.length > 1 ? availableSpace / (nodes.length - 1) : 0;

    let startX = minX;
    for (const node of nodes.sort((a, b) => a.collisionBox.getRectangle().left - b.collisionBox.getRectangle().left)) {
      StageEntityMoveManager.moveEntityToUtils(node, new Vector(startX, node.collisionBox.getRectangle().top));
      startX += node.collisionBox.getRectangle().size.x + spaceBetween;
    }
    StageHistoryManager.recordStep();
  }

  // 相等间距垂直分布对齐
  export function alignVerticalSpaceBetween() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列

    const minY = Math.min(...nodes.map((node) => node.collisionBox.getRectangle().top));
    const maxY = Math.max(...nodes.map((node) => node.collisionBox.getRectangle().bottom));
    const totalHeight = maxY - minY;
    const totalNodesHeight = nodes.reduce((sum, node) => sum + node.collisionBox.getRectangle().size.y, 0);
    const availableSpace = totalHeight - totalNodesHeight;
    const spaceBetween = nodes.length > 1 ? availableSpace / (nodes.length - 1) : 0;

    let startY = minY;
    for (const node of nodes.sort((a, b) => a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top)) {
      StageEntityMoveManager.moveEntityToUtils(node, new Vector(node.collisionBox.getRectangle().left, startY));
      startY += node.collisionBox.getRectangle().size.y + spaceBetween;
    }
    StageHistoryManager.recordStep();
  }

  /**
   * 从左到右紧密排列
   */
  export function alignLeftToRightNoSpace() {
    let nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列
    nodes = nodes.sort((a, b) => a.collisionBox.getRectangle().left - b.collisionBox.getRectangle().left);

    let leftBoundX = nodes[0].collisionBox.getRectangle().right;
    for (let i = 1; i < nodes.length; i++) {
      const currentNode = nodes[i];
      StageEntityMoveManager.moveEntityToUtils(
        currentNode,
        new Vector(leftBoundX, currentNode.collisionBox.getRectangle().top),
      );
      leftBoundX = currentNode.collisionBox.getRectangle().right;
    }
  }
  /**
   * 从上到下密排列
   */
  export function alignTopToBottomNoSpace() {
    let nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列
    nodes = nodes.sort((a, b) => a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top);

    let topBoundY = nodes[0].collisionBox.getRectangle().bottom;
    for (let i = 1; i < nodes.length; i++) {
      const currentNode = nodes[i];
      StageEntityMoveManager.moveEntityToUtils(
        currentNode,
        new Vector(currentNode.collisionBox.getRectangle().left, topBoundY),
      );
      topBoundY = currentNode.collisionBox.getRectangle().bottom;
    }
  }
}
