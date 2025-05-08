import { Rectangle } from "../../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../../dataStruct/Vector";
import { Entity } from "../../../stageObject/abstract/StageEntity";
import { StageHistoryManager } from "../../StageHistoryManager";
import { StageManager } from "../../StageManager";
import { StageEntityMoveManager } from "../StageEntityMoveManager";

export namespace LayoutToTightSquareManager {
  /**
   * 将所有选中的节点摆放排列成整齐的矩形，尽可能采取空间紧凑的布局，减少空间浪费
   * 尽可能接近美观的矩形比例，不出现极端的长方形
   * 有待优化
   */
  export function layoutToTightSquare() {
    const entities = Array.from(StageManager.getEntities()).filter((entity) => entity.isSelected);
    if (entities.length === 0) return;
    layoutToTightSquareWithEntity(entities);
    StageHistoryManager.recordStep();
  }

  export function layoutToTightSquareWithEntity(entities: Entity[]) {
    // 获取所有实体的包围盒并建立布局信息
    const layoutItems = entities.map((entity) => ({
      entity,
      rect: entity.collisionBox.getRectangle().clone(),
    }));

    // 按面积降序排序（优先放置大元素）
    layoutItems.sort((a, b) => b.rect.width * b.rect.height - a.rect.width * a.rect.height);

    // 初始化布局参数
    let layoutWidth = 0;
    let layoutHeight = 0;
    const placedRects: Rectangle[] = [];
    const spacing = 5; // 最小间距

    // 核心布局算法
    layoutItems.forEach((item) => {
      const currentRect = item.rect;
      let bestPosition: Vector | null = null;

      // 扫描现有空间寻找合适位置（三次方时间复杂度）
      for (let y = 0; y <= layoutHeight; y += spacing) {
        for (let x = 0; x <= layoutWidth; x += spacing) {
          const testRect = new Rectangle(new Vector(x, y), currentRect.size.clone());

          // 检查是否与已有元素碰撞
          const collision = placedRects.some((placed) => testRect.isCollideWith(placed.expandFromCenter(spacing)));

          if (!collision) {
            // 优先选择最靠左上的位置
            if (!bestPosition || y < bestPosition.y || (y === bestPosition.y && x < bestPosition.x)) {
              bestPosition = new Vector(x, y);
            }
          }
        }
      }

      // 如果没有找到合适位置则扩展布局
      if (!bestPosition) {
        bestPosition = new Vector(layoutWidth, 0);
        layoutWidth += currentRect.width + spacing;
        layoutHeight = Math.max(layoutHeight, currentRect.height);
      }

      // 更新实际布局边界
      const right = bestPosition.x + currentRect.width;
      const bottom = bestPosition.y + currentRect.height;
      layoutWidth = Math.max(layoutWidth, right);
      layoutHeight = Math.max(layoutHeight, bottom);

      // 记录最终位置
      currentRect.location = bestPosition;
      placedRects.push(currentRect);
    });

    // 平衡宽高比（最大1.5:1）
    const [finalWidth, finalHeight] = balanceLayoutRatio(layoutWidth, layoutHeight);

    // 计算原始包围盒中心
    const originalBounds = Rectangle.getBoundingRectangle(entities.map((e) => e.collisionBox.getRectangle()));
    const originalCenter = originalBounds.center;

    // 计算布局中心偏移量
    const offset = originalCenter.subtract(new Vector(finalWidth / 2, finalHeight / 2));

    // 应用布局位置
    layoutItems.forEach((item) => {
      const targetPos = item.rect.location.add(offset);
      StageEntityMoveManager.moveEntityToUtils(item.entity, targetPos);
    });

    // 辅助函数：平衡布局比例
    function balanceLayoutRatio(width: number, height: number, maxRatio = 1.5): [number, number] {
      const ratio = width / height;

      if (ratio > maxRatio) {
        return [width, width / maxRatio];
      }
      if (1 / ratio > maxRatio) {
        return [height * maxRatio, height];
      }
      return [width, height];
    }
  }
}
