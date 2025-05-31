import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Entity } from "../../../stageObject/abstract/StageEntity";
import { StageHistoryManager } from "../../StageHistoryManager";
import { StageManager } from "../../StageManager";

export namespace LayoutToTightSquareManager {
  /**
   * 将所有选中的节点摆放排列成整齐的矩形，尽可能采取空间紧凑的布局，减少空间浪费
   * 尽可能接近美观的矩形比例，不出现极端的长方形
   * 有待优化
   */
  export function layoutToTightSquareBySelected() {
    const entities = Array.from(StageManager.getEntities()).filter((entity) => entity.isSelected);
    if (entities.length === 0) return;
    layoutToTightSquare(entities);
    StageHistoryManager.recordStep();
  }

  export function layoutToTightSquare(entities: Entity[]) {
    if (entities.length === 0) return;
    const layoutItems = entities.map((entity) => ({
      entity,
      rect: entity.collisionBox.getRectangle().clone(),
    }));
    // 记录调整前的全部矩形的外接矩形
    const boundingRectangleBefore = Rectangle.getBoundingRectangle(layoutItems.map((item) => item.rect));

    const sortedRects = sortRectangleGreedy(
      layoutItems.map((item) => item.rect),
      20,
    );

    for (let i = 0; i < sortedRects.length; i++) {
      layoutItems[i].entity.moveTo(sortedRects[i].leftTop.clone());
    }

    // 调整后的全部矩形的外接矩形
    const boundingRectangleAfter = Rectangle.getBoundingRectangle(sortedRects);
    // 整体移动，使得全部内容的外接矩形中心坐标保持不变
    const diff = boundingRectangleBefore.center.subtract(boundingRectangleAfter.center);
    for (const item of layoutItems) {
      item.entity.move(diff);
    }
  }
}

/**
 * 
 * 装箱问题，排序矩形
    :param rectangles: N个矩形的大小和位置
    :param margin: 矩形之间的间隔（为了美观考虑）
    :return: 调整好后的N个矩形的大小和位置，数组内每个矩形一一对应。
    例如：
    rectangles = [Rectangle(NumberVector(0, 0), 10, 10), Rectangle(NumberVector(10, 10), 1, 1)]
    这两个矩形对角放，外套矩形空隙面积过大，空间浪费，需要调整位置。

    调整后返回：

    [Rectangle(NumberVector(0, 0), 10, 10), Rectangle(NumberVector(12, 0), 1, 1)]
    参数 margin = 2
    横向放置，减少了空间浪费。
 * 
 * 
 * 
 * 
 */

// 从visual-file项目里抄过来的

function sortRectangleGreedy(rectangles: Rectangle[], margin = 20): Rectangle[] {
  if (rectangles.length === 0) return [];

  // 处理第一个矩形
  const firstOriginal = rectangles[0];
  const first = new Rectangle(new Vector(0, 0), new Vector(firstOriginal.size.x, firstOriginal.size.y));
  const ret: Rectangle[] = [first];
  let currentWidth = first.right;
  let currentHeight = first.bottom;

  for (let i = 1; i < rectangles.length; i++) {
    const originalRect = rectangles[i];
    let bestCandidate: Rectangle | null = null;
    let minSpaceScore = Infinity;
    let minShapeScore = Infinity;

    for (const placedRect of ret) {
      // 尝试放在右侧
      const candidateRight = appendRight(placedRect, originalRect, ret, margin);
      const rightSpaceScore =
        Math.max(currentWidth, candidateRight.right) -
        currentWidth +
        (Math.max(currentHeight, candidateRight.bottom) - currentHeight);
      const rightShapeScore = Math.abs(
        Math.max(candidateRight.right, currentWidth) - Math.max(candidateRight.bottom, currentHeight),
      );

      if (rightSpaceScore < minSpaceScore || (rightSpaceScore === minSpaceScore && rightShapeScore < minShapeScore)) {
        minSpaceScore = rightSpaceScore;
        minShapeScore = rightShapeScore;
        bestCandidate = candidateRight;
      }

      // 尝试放在下方
      const candidateBottom = appendBottom(placedRect, originalRect, ret, margin);
      const bottomSpaceScore =
        Math.max(currentWidth, candidateBottom.right) -
        currentWidth +
        (Math.max(currentHeight, candidateBottom.bottom) - currentHeight);
      const bottomShapeScore = Math.abs(
        Math.max(candidateBottom.right, currentWidth) - Math.max(candidateBottom.bottom, currentHeight),
      );

      if (
        bottomSpaceScore < minSpaceScore ||
        (bottomSpaceScore === minSpaceScore && bottomShapeScore < minShapeScore)
      ) {
        minSpaceScore = bottomSpaceScore;
        minShapeScore = bottomShapeScore;
        bestCandidate = candidateBottom;
      }
    }

    if (bestCandidate) {
      ret.push(bestCandidate);
      currentWidth = Math.max(currentWidth, bestCandidate.right);
      currentHeight = Math.max(currentHeight, bestCandidate.bottom);
    } else {
      throw new Error("No candidate found");
    }
  }

  return ret;
}

function appendRight(origin: Rectangle, originalRect: Rectangle, existingRects: Rectangle[], margin = 20): Rectangle {
  const candidate = new Rectangle(
    new Vector(origin.right + margin, origin.location.y),
    new Vector(originalRect.size.x, originalRect.size.y),
  );

  let hasCollision: boolean;
  do {
    hasCollision = false;
    for (const existing of existingRects) {
      if (candidate.isCollideWithRectangle(existing)) {
        hasCollision = true;
        // 调整位置：下移到底部并保持右侧对齐
        candidate.location.y = existing.bottom;
        candidate.location.x = Math.max(candidate.location.x, existing.right);
        break;
      }
    }
  } while (hasCollision);

  return candidate;
}

function appendBottom(origin: Rectangle, originalRect: Rectangle, existingRects: Rectangle[], margin = 20): Rectangle {
  const candidate = new Rectangle(
    new Vector(origin.location.x, origin.bottom + margin),
    new Vector(originalRect.size.x, originalRect.size.y),
  );

  let hasCollision: boolean;
  do {
    hasCollision = false;
    for (const existing of existingRects) {
      if (candidate.isCollideWithRectangle(existing)) {
        hasCollision = true;
        // 调整位置：右移并保持底部对齐
        candidate.location.x = existing.right;
        candidate.location.y = Math.max(candidate.location.y, existing.bottom);
        break;
      }
    }
  } while (hasCollision);

  return candidate;
}
