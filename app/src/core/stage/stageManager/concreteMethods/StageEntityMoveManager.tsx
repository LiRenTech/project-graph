import { Vector } from "../../../dataStruct/Vector";
import { EntityJumpMoveEffect } from "../../../service/feedbackService/effectEngine/concrete/EntityJumpMoveEffect";
import { RectanglePushInEffect } from "../../../service/feedbackService/effectEngine/concrete/RectanglePushInEffect";
import { Stage } from "../../Stage";
import { ConnectableEntity } from "../../stageObject/abstract/ConnectableEntity";
import { Entity } from "../../stageObject/abstract/StageEntity";
import { GraphMethods } from "../basicMethods/GraphMethods";
import { SectionMethods } from "../basicMethods/SectionMethods";
import { StageManager } from "../StageManager";

/**
 * 管理节点的位置移动
 * 不仅仅有鼠标拖动的移动，还有对齐造成的移动
 * 还要处理节点移动后，对Section大小造成的影响
 * 以后还可能有自动布局的功能
 */
export namespace StageEntityMoveManager {
  export function moveEntityUtils(node: Entity, delta: Vector, isAutoAdjustSection: boolean = true) {
    // 让自己移动
    node.move(delta);

    const nodeUUID = node.uuid;

    // if (StageManager.isSectionByUUID(nodeUUID)) {
    //   // 如果是Section，则需要带动孩子一起移动
    //   const section = StageManager.getSectionByUUID(nodeUUID);
    //   if (section) {
    //     for (const child of section.children) {
    //       moveEntityUtils(child, delta);
    //     }
    //   }
    // }
    if (isAutoAdjustSection) {
      for (const section of StageManager.getSections()) {
        if (section.isHaveChildrenByUUID(nodeUUID)) {
          section.adjustLocationAndSize();
        }
      }
    }
  }

  export function jumpMoveEntityUtils(entity: Entity, delta: Vector) {
    const beforeMoveRect = entity.collisionBox.getRectangle().clone();

    // 将自己移动前加特效
    Stage.effectMachine.addEffect(new EntityJumpMoveEffect(15, beforeMoveRect, delta));

    // 即将跳入的sections区域
    const targetSections = SectionMethods.getSectionsByInnerLocation(beforeMoveRect.center.add(delta));
    // 改变层级
    if (targetSections.length === 0) {
      // 代表想要走出当前section
      const currentFatherSections = SectionMethods.getFatherSections(entity);
      if (currentFatherSections.length !== 0) {
        StageManager.goOutSection([entity], currentFatherSections[0]);
      }
    } else {
      for (const section of targetSections) {
        StageManager.goInSection([entity], section);
        // 特效
        Stage.effectMachine.addEffect(
          new RectanglePushInEffect(entity.collisionBox.getRectangle(), section.collisionBox.getRectangle()),
        );
      }
    }

    // 让自己移动
    // entity.move(delta);
    moveEntityUtils(entity, delta, false);
  }

  function moveEntityToUtils(entity: Entity, location: Vector) {
    entity.moveTo(location);
    const nodeUUID = entity.uuid;
    for (const section of StageManager.getSections()) {
      if (section.isHaveChildrenByUUID(nodeUUID)) {
        section.adjustLocationAndSize();
      }
    }
  }
  export function moveEntities(delta: Vector, isAutoAdjustSection: boolean = true) {
    for (const node of StageManager.getEntities()) {
      if (node.isSelected) {
        moveEntityUtils(node, delta, isAutoAdjustSection);
      }
    }
  }
  /**
   * 拖动所有选中的节点一起移动
   * @param delta
   */
  export function moveSelectedNodes(delta: Vector, isAutoAdjustSection: boolean = true) {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        moveEntityUtils(node, delta, isAutoAdjustSection);
      }
    }
  }

  export function jumpMoveSelectedConnectableEntities(delta: Vector) {
    for (const node of StageManager.getConnectableEntity()) {
      if (node.isSelected) {
        jumpMoveEntityUtils(node, delta);
      }
    }
  }

  export function moveSelectedSections(delta: Vector, isAutoAdjustSection: boolean = true) {
    for (const section of StageManager.getSections()) {
      if (section.isSelected) {
        moveEntityUtils(section, delta, isAutoAdjustSection);
      }
    }
  }
  export function moveSelectedConnectPoints(delta: Vector, isAutoAdjustSection: boolean = true) {
    for (const point of StageManager.getConnectPoints()) {
      if (point.isSelected) {
        moveEntityUtils(point, delta, isAutoAdjustSection);
      }
    }
  }
  export function moveSelectedImageNodes(delta: Vector, isAutoAdjustSection: boolean = true) {
    for (const node of StageManager.getImageNodes()) {
      if (node.isSelected) {
        moveEntityUtils(node, delta, isAutoAdjustSection);
      }
    }
  }
  export function moveSelectedUrlNodes(delta: Vector, isAutoAdjustSection: boolean = true) {
    for (const node of StageManager.getUrlNodes()) {
      if (node.isSelected) {
        moveEntityUtils(node, delta, isAutoAdjustSection);
      }
    }
  }
  export function moveSelectedPortalNodes(delta: Vector, isAutoAdjustSection: boolean = true) {
    for (const node of StageManager.getPortalNodes()) {
      if (node.isSelected) {
        moveEntityUtils(node, delta, isAutoAdjustSection);
      }
    }
  }
  export function moveSelectedPenStrokes(delta: Vector, isAutoAdjustSection: boolean = true) {
    for (const node of StageManager.getPenStrokes()) {
      if (node.isSelected) {
        moveEntityUtils(node, delta, isAutoAdjustSection);
      }
    }
  }

  export function moveNodesWithChildren(delta: Vector) {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        moveWithChildren(node, delta);
      }
    }
    for (const section of StageManager.getSections()) {
      if (section.isSelected) {
        moveWithChildren(section, delta);
      }
    }
  }
  function moveWithChildren(node: ConnectableEntity, delta: Vector) {
    moveWithChildrenDfs(node, delta, [node.uuid]);
  }

  function moveWithChildrenDfs(node: ConnectableEntity, delta: Vector, visitedUUIDs: string[]) {
    moveEntityUtils(node, delta);
    for (const child of GraphMethods.nodeChildrenArray(node)) {
      if (visitedUUIDs.includes(child.uuid)) {
        continue;
      }
      visitedUUIDs.push(child.uuid);
      moveWithChildrenDfs(child, delta, visitedUUIDs);
    }
  }

  // 按住shift键移动

  // 对齐功能

  // 左侧对齐
  export function alignLeft() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    const minX = Math.min(...nodes.map((node) => node.collisionBox.getRectangle().left));
    for (const node of nodes) {
      moveEntityUtils(node, new Vector(minX - node.collisionBox.getRectangle().left, 0));
    }
  }

  // 右侧对齐
  export function alignRight() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    const maxX = Math.max(...nodes.map((node) => node.collisionBox.getRectangle().right));
    for (const node of nodes) {
      moveEntityUtils(node, new Vector(maxX - node.collisionBox.getRectangle().right, 0));
    }
  }

  // 上侧对齐
  export function alignTop() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    const minY = Math.min(...nodes.map((node) => node.collisionBox.getRectangle().top));
    for (const node of nodes) {
      moveEntityUtils(node, new Vector(0, minY - node.collisionBox.getRectangle().top));
    }
  }

  // 下侧对齐
  export function alignBottom() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    const maxY = Math.max(...nodes.map((node) => node.collisionBox.getRectangle().bottom));
    for (const node of nodes) {
      moveEntityUtils(node, new Vector(0, maxY - node.collisionBox.getRectangle().bottom));
    }
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
      moveEntityToUtils(node, new Vector(node.collisionBox.getRectangle().left, newY));
    }
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
      moveEntityToUtils(node, new Vector(newX, node.collisionBox.getRectangle().top));
    }
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
      moveEntityToUtils(node, new Vector(startX, node.collisionBox.getRectangle().top));
      startX += node.collisionBox.getRectangle().size.x + spaceBetween;
    }
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
      moveEntityToUtils(node, new Vector(node.collisionBox.getRectangle().left, startY));
      startY += node.collisionBox.getRectangle().size.y + spaceBetween;
    }
  }

  /**
   * 将所有选中的节点尽可能摆放排列成正方形
   */
  export function layoutToSquare() {
    const nodes = Array.from(StageManager.getEntities()).filter((node) => node.isSelected);
    const n = nodes.length;
    if (n <= 1) return;

    // 计算所有节点的最大宽度和高度
    let maxWidth = 0,
      maxHeight = 0;
    nodes.forEach((node) => {
      const rect = node.collisionBox.getRectangle();
      maxWidth = Math.max(maxWidth, rect.size.x);
      maxHeight = Math.max(maxHeight, rect.size.y);
    });

    const spacing = 20; // 单元格之间的间距
    const cellSize = Math.max(maxWidth, maxHeight) + spacing;

    // 计算最优的行列数，使网格尽可能接近正方形
    const { rows, cols } = getOptimalRowsCols(n);

    // 计算网格的总尺寸
    const gridWidth = cols * cellSize;
    const gridHeight = rows * cellSize;

    // 计算原始包围盒的中心点
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    nodes.forEach((node) => {
      const rect = node.collisionBox.getRectangle();
      minX = Math.min(minX, rect.left);
      minY = Math.min(minY, rect.top);
      maxX = Math.max(maxX, rect.right);
      maxY = Math.max(maxY, rect.bottom);
    });
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // 计算网格的起始位置（左上角）
    const startX = centerX - gridWidth / 2;
    const startY = centerY - gridHeight / 2;

    // 将节点排列到网格中
    nodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const cellCenterX = startX + col * cellSize + cellSize / 2;
      const cellCenterY = startY + row * cellSize + cellSize / 2;
      const rect = node.collisionBox.getRectangle();
      const newX = cellCenterX - rect.size.x / 2;
      const newY = cellCenterY - rect.size.y / 2;
      moveEntityToUtils(node, new Vector(newX, newY));
    });
  }

  /**
   * 将所有选中的节点摆放排列成整齐的矩形，尽可能采取空间紧凑的布局，减少空间浪费
   * 尽可能接近美观的矩形比例，不出现极端的长方形
   */

  export function layoutToTightSquare() {
    // TODO: 实现
  }
}

// 辅助函数：计算最优的行列数，使网格尽可能接近正方形
function getOptimalRowsCols(n: number): { rows: number; cols: number } {
  let bestRows = Math.floor(Math.sqrt(n));
  let bestCols = Math.ceil(n / bestRows);
  let bestDiff = Math.abs(bestRows - bestCols);

  // 遍历可能的行数，寻找行列差最小的情况
  for (let rows = bestRows; rows >= 1; rows--) {
    const cols = Math.ceil(n / rows);
    const diff = Math.abs(rows - cols);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestRows = rows;
      bestCols = cols;
    }
  }

  return { rows: bestRows, cols: bestCols };
}
