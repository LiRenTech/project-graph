import { Vector } from "../../../../dataStruct/Vector";
import { StageHistoryManager } from "../../StageHistoryManager";
import { StageManager } from "../../StageManager";
import { StageEntityMoveManager } from "../StageEntityMoveManager";

export namespace LayoutToSquareManager {
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
      StageEntityMoveManager.moveEntityToUtils(node, new Vector(newX, newY));
    });
    StageHistoryManager.recordStep();
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
