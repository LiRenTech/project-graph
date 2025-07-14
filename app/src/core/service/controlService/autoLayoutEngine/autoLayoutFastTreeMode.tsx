import { Rectangle } from "../../../dataStruct/shape/Rectangle";
import { Vector } from "../../../dataStruct/Vector";
import { GraphMethods } from "../../../stage/stageManager/basicMethods/GraphMethods";
import { StageEntityMoveManager } from "../../../stage/stageManager/concreteMethods/StageEntityMoveManager";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";

/**
 * 瞬间树形布局算法
 * 瞬间：一次性直接移动所有节点到合适的位置
 * 树形：此布局算法仅限于树形结构，在代码上游保证
 */
export namespace AutoLayoutFastTree {
  /**
   * 向下树形布局
   * @param rootNode 树形节点的根节点
   */
  export function autoLayoutFastTreeModeDown(rootNode: ConnectableEntity) {
    const dfs = (node: ConnectableEntity) => {
      const spaceX = 20;
      const spaceY = 150;
      // 子节点所占空间的宽度
      let width = Math.max(0, GraphMethods.nodeChildrenArray(node).length - 1) * spaceX;
      const widths: number[] = [];
      const paddings: number[] = [];
      let sumWidths = -width; // widths元素之和
      for (const child of GraphMethods.nodeChildrenArray(node)) {
        const childrenWidth = dfs(child);
        const wd = child.collisionBox.getRectangle().size.x;
        widths.push(Math.max(wd, childrenWidth));
        paddings.push(widths[widths.length - 1] / 2 - wd / 2);
        width += widths[widths.length - 1];
      }
      sumWidths += width;
      let currentX =
        node.geometryCenter.x - (sumWidths - paddings[0] - paddings[paddings.length - 1]) / 2 - paddings[0];
      for (let i = 0; i < widths.length; i++) {
        const child = GraphMethods.nodeChildrenArray(node)[i];
        child.moveTo(new Vector(currentX + paddings[i], node.collisionBox.getRectangle().top + spaceY));
        currentX += widths[i] + spaceX;
      }
      return width;
    };
    dfs(rootNode);
  }

  /**
   * 获取当前树的外接矩形，注意不要有环，有环就废了
   * @param node
   * @returns
   */
  export function getTreeBoundingRectangle(node: ConnectableEntity): Rectangle {
    const childList = GraphMethods.nodeChildrenArray(node);
    const childRectangle = childList.map((child) => getTreeBoundingRectangle(child));
    return Rectangle.getBoundingRectangle(childRectangle.concat([node.collisionBox.getRectangle()]));
  }
  /**
   * 将一个子树 看成一个外接矩形，移动这个外接矩形到某一个位置
   * @param treeRoot
   * @param targetLocation
   */
  export function moveTreeRectTo(treeRoot: ConnectableEntity, targetLocation: Vector) {
    const treeRect = getTreeBoundingRectangle(treeRoot);
    StageEntityMoveManager.moveWithChildren(treeRoot, targetLocation.subtract(treeRect.leftTop));
  }

  /**
   * 排列多个子树，使得它们在一列上
   * @param trees
   * @returns
   */
  export function alignColumnTrees(trees: ConnectableEntity[], gap = 10) {
    if (trees.length === 0 || trees.length === 1) {
      return;
    }
    const firstTree = trees[0];
    const firstTreeRect = getTreeBoundingRectangle(firstTree);
    const currentLeftTop = firstTreeRect.leftBottom.add(new Vector(0, gap));
    // 将这些子树向下排列时，要保持从上到下的相对位置
    trees.sort((a, b) => a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top);
    for (let i = 1; i < trees.length; i++) {
      const tree = trees[i];
      moveTreeRectTo(tree, currentLeftTop);
      currentLeftTop.y += getTreeBoundingRectangle(tree).height + gap;
    }
  }

  /**
   * 根据子节点，调整根节点的位置
   * 然后最终返回的是 自己整个子树的外接矩形
   * @param rootNode
   */
  export function adjustRootNodeLocationByChildren(rootNode: ConnectableEntity, gap = 100) {
    const childList = GraphMethods.nodeChildrenArray(rootNode);
    if (childList.length === 0) {
      return;
    }
    const childsRectangle = Rectangle.getBoundingRectangle(childList.map((child) => child.collisionBox.getRectangle()));
    const parentRectangle = rootNode.collisionBox.getRectangle();
    const parentNodeRightCenterTargetLocation = childsRectangle.leftCenter.add(new Vector(-gap, 0));
    rootNode.moveTo(parentNodeRightCenterTargetLocation);
    rootNode.move(new Vector(-parentRectangle.width, -parentRectangle.height / 2));
  }
  /**
   * 向右树形节点的根节点
   * @param rootNode
   */
  export function autoLayoutFastTreeModeRight(rootNode: ConnectableEntity) {
    // 树形结构的根节点 左上角位置固定不动
    const initLocation = rootNode.collisionBox.getRectangle().leftTop.clone();

    const dfs = (node: ConnectableEntity) => {
      // 按照从上到下的顺序排序
      const childList = GraphMethods.nodeChildrenArray(node).sort(
        (a, b) => a.collisionBox.getRectangle().top - b.collisionBox.getRectangle().top,
      );
      for (const child of childList) {
        dfs(child); // 递归口
      }
      // 排列这些子节点
      alignColumnTrees(childList, 20);
      // 将当前节点放到所有子节点的左侧
      adjustRootNodeLocationByChildren(node, 150);
    };

    dfs(rootNode);
    // rootNode.moveTo(initLocation);
    const delta = initLocation.subtract(rootNode.collisionBox.getRectangle().leftTop);
    // 选中根节点
    StageManager.clearSelectAll();
    rootNode.isSelected = true;
    StageEntityMoveManager.moveConnectableEntitiesWithChildren(delta);
  }

  // ======================= 反转树的位置系列 ====================

  export function treeReverseX(selectedRootEntity: ConnectableEntity) {
    treeReverse(selectedRootEntity, "X");
  }
  export function treeReverseY(selectedRootEntity: ConnectableEntity) {
    treeReverse(selectedRootEntity, "Y");
  }
  /**
   * 将树形结构翻转位置
   * @param selectedRootEntity
   */
  function treeReverse(selectedRootEntity: ConnectableEntity, direction: "X" | "Y") {
    // 检测树形结构
    const nodeChildrenArray = GraphMethods.nodeChildrenArray(selectedRootEntity);
    if (nodeChildrenArray.length <= 1) {
      return;
    }
    // 遍历所有节点，将其位置根据选中的根节点进行镜像位置调整
    const dfs = (node: ConnectableEntity) => {
      const childList = GraphMethods.nodeChildrenArray(node);
      for (const child of childList) {
        dfs(child); // 递归口
      }
      const currentNodeCenter = node.collisionBox.getRectangle().center;
      const rootNodeCenter = selectedRootEntity.collisionBox.getRectangle().center;
      if (direction === "X") {
        node.move(new Vector(-((currentNodeCenter.x - rootNodeCenter.x) * 2), 0));
      } else if (direction === "Y") {
        node.move(new Vector(0, -((currentNodeCenter.y - rootNodeCenter.y) * 2)));
      }
    };
    dfs(selectedRootEntity);
  }
}
