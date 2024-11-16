import { Vector } from "../../../dataStruct/Vector";
import { ConnectableEntity, Entity } from "../../../stageObject/StageObject";
import { StageManager } from "../StageManager";

/**
 * 管理节点的位置移动
 * 不仅仅有鼠标拖动的移动，还有对齐造成的移动
 * 还要处理节点移动后，对Section大小造成的影响
 * 以后还可能有自动布局的功能
 */
export namespace StageEntityMoveManager {
  export function moveEntityUtils(node: Entity, delta: Vector) {
    // 让自己移动
    node.move(delta);

    const nodeUUID = node.uuid;

    if (StageManager.isSectionByUUID(nodeUUID)) {
      // 如果是Section，则需要带动孩子一起移动
      const section = StageManager.getSectionByUUID(nodeUUID);
      if (section) {
        for (const child of section.children) {
          moveEntityUtils(child, delta);
        }
      }
    }
    for (const section of StageManager.getSections()) {
      if (section.isHaveChildrenByUUID(nodeUUID)) {
        section.adjustLocationAndSize();
      }
    }
  }

  function moveNodeToUtils(node: Entity, location: Vector) {
    node.moveTo(location);
    const nodeUUID = node.uuid;
    for (const section of StageManager.getSections()) {
      if (section.isHaveChildrenByUUID(nodeUUID)) {
        section.adjustLocationAndSize();
      }
    }
  }

  /**
   * 拖动所有选中的节点一起移动
   * @param delta
   */
  export function moveNodes(delta: Vector) {
    for (const node of StageManager.getTextNodes()) {
      if (node.isSelected) {
        moveEntityUtils(node, delta);
      }
    }
  }
  export function moveSections(delta: Vector) {
    for (const section of StageManager.getSections()) {
      if (section.isSelected) {
        moveEntityUtils(section, delta);
      }
    }
  }
  export function moveConnectPoints(delta: Vector) {
    for (const point of StageManager.getConnectPoints()) {
      if (point.isSelected) {
        moveEntityUtils(point, delta);
      }
    }
  }
  export function moveImageNodes(delta: Vector) {
    for (const node of StageManager.getImageNodes()) {
      if (node.isSelected) {
        moveEntityUtils(node, delta);
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

  function moveWithChildrenDfs(
    node: ConnectableEntity,
    delta: Vector,
    visitedUUIDs: string[],
  ) {
    moveEntityUtils(node, delta);
    for (const child of StageManager.nodeChildrenArray(node)) {
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
    const nodes = Array.from(StageManager.getEntities()).filter(
      (node) => node.isSelected,
    );
    const minX = Math.min(
      ...nodes.map((node) => node.collisionBox.getRectangle().left),
    );
    for (const node of nodes) {
      moveEntityUtils(
        node,
        new Vector(minX - node.collisionBox.getRectangle().left, 0),
      );
    }
  }

  // 右侧对齐
  export function alignRight() {
    const nodes = Array.from(StageManager.getEntities()).filter(
      (node) => node.isSelected,
    );
    const maxX = Math.max(
      ...nodes.map((node) => node.collisionBox.getRectangle().right),
    );
    for (const node of nodes) {
      moveEntityUtils(
        node,
        new Vector(maxX - node.collisionBox.getRectangle().right, 0),
      );
    }
  }

  // 上侧对齐
  export function alignTop() {
    const nodes = Array.from(StageManager.getEntities()).filter(
      (node) => node.isSelected,
    );
    const minY = Math.min(
      ...nodes.map((node) => node.collisionBox.getRectangle().top),
    );
    for (const node of nodes) {
      moveEntityUtils(
        node,
        new Vector(0, minY - node.collisionBox.getRectangle().top),
      );
    }
  }

  // 下侧对齐
  export function alignBottom() {
    const nodes = Array.from(StageManager.getEntities()).filter(
      (node) => node.isSelected,
    );
    const maxY = Math.max(
      ...nodes.map((node) => node.collisionBox.getRectangle().bottom),
    );
    for (const node of nodes) {
      moveEntityUtils(
        node,
        new Vector(0, maxY - node.collisionBox.getRectangle().bottom),
      );
    }
  }

  export function alignCenterHorizontal() {
    const nodes = Array.from(StageManager.getEntities()).filter(
      (node) => node.isSelected,
    );
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列

    // 计算所有选中节点的总高度和最小 y 坐标
    const minY = Math.min(
      ...nodes.map((node) => node.collisionBox.getRectangle().top),
    );
    const maxY = Math.max(
      ...nodes.map((node) => node.collisionBox.getRectangle().bottom),
    );
    const totalHeight = maxY - minY;
    const centerY = minY + totalHeight / 2;

    for (const node of nodes) {
      const nodeCenterY =
        node.collisionBox.getRectangle().top +
        node.collisionBox.getRectangle().size.y / 2;
      const newY =
        centerY - (nodeCenterY - node.collisionBox.getRectangle().top);
      moveNodeToUtils(
        node,
        new Vector(node.collisionBox.getRectangle().left, newY),
      );
    }
  }

  export function alignCenterVertical() {
    const nodes = Array.from(StageManager.getEntities()).filter(
      (node) => node.isSelected,
    );
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列

    // 计算所有选中节点的总宽度和最小 x 坐标
    const minX = Math.min(
      ...nodes.map((node) => node.collisionBox.getRectangle().left),
    );
    const maxX = Math.max(
      ...nodes.map((node) => node.collisionBox.getRectangle().right),
    );
    const totalWidth = maxX - minX;
    const centerX = minX + totalWidth / 2;

    for (const node of nodes) {
      const nodeCenterX =
        node.collisionBox.getRectangle().left +
        node.collisionBox.getRectangle().size.x / 2;
      const newX =
        centerX - (nodeCenterX - node.collisionBox.getRectangle().left);
      moveNodeToUtils(
        node,
        new Vector(newX, node.collisionBox.getRectangle().top),
      );
    }
  }

  // 相等间距水平分布对齐
  export function alignHorizontalSpaceBetween() {
    const nodes = Array.from(StageManager.getEntities()).filter(
      (node) => node.isSelected,
    );
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列

    const minX = Math.min(
      ...nodes.map((node) => node.collisionBox.getRectangle().left),
    );
    const maxX = Math.max(
      ...nodes.map((node) => node.collisionBox.getRectangle().right),
    );
    const totalWidth = maxX - minX;
    const totalNodesWidth = nodes.reduce(
      (sum, node) => sum + node.collisionBox.getRectangle().size.x,
      0,
    );
    const availableSpace = totalWidth - totalNodesWidth;
    const spaceBetween =
      nodes.length > 1 ? availableSpace / (nodes.length - 1) : 0;

    let startX = minX;
    for (const node of nodes.sort(
      (a, b) =>
        a.collisionBox.getRectangle().left - b.collisionBox.getRectangle().left,
    )) {
      moveNodeToUtils(
        node,
        new Vector(startX, node.collisionBox.getRectangle().top),
      );
      startX += node.collisionBox.getRectangle().size.x + spaceBetween;
    }
  }

  // 相等间距垂直分布对齐
  export function alignVerticalSpaceBetween() {
    const nodes = Array.from(StageManager.getEntities()).filter(
      (node) => node.isSelected,
    );
    if (nodes.length <= 1) return; // 如果只有一个或没有选中的节点，则不需要重新排列

    const minY = Math.min(
      ...nodes.map((node) => node.collisionBox.getRectangle().top),
    );
    const maxY = Math.max(
      ...nodes.map((node) => node.collisionBox.getRectangle().bottom),
    );
    const totalHeight = maxY - minY;
    const totalNodesHeight = nodes.reduce(
      (sum, node) => sum + node.collisionBox.getRectangle().size.y,
      0,
    );
    const availableSpace = totalHeight - totalNodesHeight;
    const spaceBetween =
      nodes.length > 1 ? availableSpace / (nodes.length - 1) : 0;

    let startY = minY;
    for (const node of nodes.sort(
      (a, b) =>
        a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top,
    )) {
      moveNodeToUtils(
        node,
        new Vector(node.collisionBox.getRectangle().left, startY),
      );
      startY += node.collisionBox.getRectangle().size.y + spaceBetween;
    }
  }
}
