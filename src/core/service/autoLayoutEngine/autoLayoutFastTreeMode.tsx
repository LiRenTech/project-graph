/**
 * 瞬间树形布局算法
 * 瞬间：一次性直接移动所有节点到合适的位置
 * 树形：此布局算法仅限于树形结构，在代码上游保证
 */

import { Vector } from "../../dataStruct/Vector";
import { StageManager } from "../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../stage/stageObject/StageObject";

/**
 * 树形节点的根节点
 * @param rootNode
 */
export function autoLayoutFastTreeMode(rootNode: ConnectableEntity) {
  const dfs = (node: ConnectableEntity) => {
    const spaceX = 20;
    const spaceY = 150;
    // 子节点所占空间的宽度
    let width =
      Math.max(0, StageManager.nodeChildrenArray(node).length - 1) * spaceX;
    const widths: number[] = [];
    const paddings: number[] = [];
    let sumWidths = -width; // widths元素之和
    for (const child of StageManager.nodeChildrenArray(node)) {
      const childrenWidth = dfs(child);
      const wd = child.collisionBox.getRectangle().size.x;
      widths.push(Math.max(wd, childrenWidth));
      paddings.push(widths[widths.length - 1] / 2 - wd / 2);
      width += widths[widths.length - 1];
    }
    sumWidths += width;
    let currentX =
      node.geometryCenter.x -
      (sumWidths - paddings[0] - paddings[paddings.length - 1]) / 2 -
      paddings[0];
    for (let i = 0; i < widths.length; i++) {
      const child = StageManager.nodeChildrenArray(node)[i];
      child.moveTo(
        new Vector(
          currentX + paddings[i],
          node.collisionBox.getRectangle().top + spaceY,
        ),
      );
      currentX += widths[i] + spaceX;
    }
    return width;
  };
  dfs(rootNode);
}
