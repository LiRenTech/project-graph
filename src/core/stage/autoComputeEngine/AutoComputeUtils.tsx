import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";
import { StageManager } from "../stageManager/StageManager";
import { v4 as uuidv4 } from "uuid";

/**
 * 一些在自动计算引擎中
 * 常用的工具函数
 */
export namespace AutoComputeUtils {
  /**
   * 获取一个节点的所有直接父节点，按x坐标排序
   * @param node
   * @returns
   */
  export function getParentTextNodes(node: TextNode): TextNode[] {
    const parents = StageManager.nodeParentArray(node).filter(
      (node) => node instanceof TextNode,
    );
    // 将parents按x的坐标排序，小的在前面
    parents.sort((a, b) => {
      return (
        a.collisionBox.getRectangle().location.x -
        b.collisionBox.getRectangle().location.x
      );
    });
    return parents;
  }

  /**
   * 更改一个TextNode节点的所有子节点名字，如果没有子节点，则新建一个节点
   * @param node
   * @param resultText
   */
  export function getNodeOneResult(node: TextNode, resultText: string) {
    const childrenList = StageManager.nodeChildrenArray(node).filter(
      (node) => node instanceof TextNode,
    );
    if (childrenList.length > 0) {
      for (const child of childrenList) {
        child.rename(resultText);
      }
    } else {
      // 新建一个节点生长出去
      const newNode = new TextNode({
        uuid: uuidv4(),
        text: resultText,
        location: [
          node.collisionBox.getRectangle().location.x,
          node.collisionBox.getRectangle().location.y + 100,
        ],
        size: [100, 100],
        color: [0, 0, 0, 0],
      });
      StageManager.addTextNode(newNode);
      StageManager.connectEntity(node, newNode);
    }
  }

  /**
   * 更改一个section节点的所有子节点名字，如果没有子节点，则新建一个节点
   * @param section
   * @param resultText
   */
  export function getSectionOneResult(section: Section, resultText: string) {
    const childrenList = StageManager.nodeChildrenArray(section).filter(
      (node) => node instanceof TextNode,
    );
    if (childrenList.length > 0) {
      for (const child of childrenList) {
        child.rename(resultText);
      }
    } else {
      // 新建一个节点生长出去
      const newNode = new TextNode({
        uuid: uuidv4(),
        text: resultText,
        location: [
          section.collisionBox.getRectangle().location.x,
          section.collisionBox.getRectangle().bottom + 100,
        ],
        size: [100, 100],
        color: [0, 0, 0, 0],
      });
      StageManager.addTextNode(newNode);
      StageManager.connectEntity(section, newNode);
    }
  }

  /**
   * 生成一个节点的多个结果
   * 如果子节点数量不够，则新建节点
   * @param node
   * @param resultTextList
   */
  export function getMultiResult(node: TextNode, resultTextList: string[]) {
    // 先把子节点数量凑够
    let childrenList = StageManager.nodeChildrenArray(node).filter(
      (node) => node instanceof TextNode,
    );
    if (childrenList.length < resultTextList.length) {
      // 子节点数量不够，需要新建节点
      const needCount = resultTextList.length - childrenList.length;
      for (let j = 0; j < needCount; j++) {
        const newNode = new TextNode({
          uuid: uuidv4(),
          text: "",
          location: [
            node.collisionBox.getRectangle().location.x,
            node.collisionBox.getRectangle().location.y + 100 + j * 100,
          ],
          size: [100, 100],
          color: [0, 0, 0, 0],
        });
        StageManager.addTextNode(newNode);
        StageManager.connectEntity(node, newNode);
      }
    }
    // 子节点数量够了，直接修改，顺序是从上到下
    childrenList = StageManager.nodeChildrenArray(node)
      .filter((node) => node instanceof TextNode)
      .sort(
        (node1, node2) =>
          node1.collisionBox.getRectangle().location.y -
          node2.collisionBox.getRectangle().location.y,
      );
    // 开始修改
    let i = -1;
    for (const child of childrenList) {
      child.rename(resultTextList[++i]);
    }
  }

  /**
   * 将字符串转换为数字
   * @param str
   * @returns
   */
  export function stringToNumber(str: string) {
    return parseFloat(str);
  }
}
