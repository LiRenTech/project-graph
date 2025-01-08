/**
 * 瞬间树形布局算法
 * 瞬间：一次性直接移动所有节点到合适的位置
 * 树形：此布局算法仅限于树形结构，在代码上游保证
 */

import { Vector } from "../../dataStruct/Vector";
import { ConnectableEntity } from "../../stageObject/StageObject";
import { StageManager } from "../stageManager/StageManager";

/**
 * 树形节点的根节点
 * @param rootNode
 */
export function autoLayoutFastTreeMode(rootNode: ConnectableEntity) {
  // 测试：将树形结构中的节点全部向右移动10px
  const dfs = (node: ConnectableEntity) => {
    // move和moveTo方法都可以使用
    node.move(new Vector(10, 0));

    const rectangle = node.collisionBox.getRectangle();
    console.log("检测到该实体的外接矩形：", rectangle);
    console.log(
      rectangle.left,
      rectangle.right,
      rectangle.top,
      rectangle.bottom,
      rectangle.center,
      rectangle.size.x,
      rectangle.size.y,
    );

    for (const child of StageManager.nodeChildrenArray(node)) {
      // 直接连接检测
      const t = StageManager.isConnected(node, child);
      console.log(t, "必定为true");

      dfs(child);
    }
  };
  dfs(rootNode);
}
