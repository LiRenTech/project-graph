import { v4 as uuidv4 } from "uuid";
import { GraphMethods } from "../../../stage/stageManager/basicMethods/GraphMethods";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { Section } from "../../../stage/stageObject/entity/Section";
import { TextNode } from "../../../stage/stageObject/entity/TextNode";
import { ProgramFunctions } from "./functions/programLogic";

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
    const parents = GraphMethods.nodeParentArray(node).filter((node) => node instanceof TextNode);
    // 将parents按x的坐标排序，小的在前面
    parents.sort((a, b) => {
      return a.collisionBox.getRectangle().location.x - b.collisionBox.getRectangle().location.x;
    });
    return parents;
  }

  export function getParentEntities(node: TextNode): ConnectableEntity[] {
    const parents = GraphMethods.nodeParentArray(node);
    // 将parents按x的坐标排序，小的在前面
    parents.sort((a, b) => {
      return a.collisionBox.getRectangle().location.x - b.collisionBox.getRectangle().location.x;
    });
    return parents;
  }

  /**
   * 获取一个节点的所有直接子节点，按x坐标排序
   * @param node
   * @returns
   */
  export function getChildTextNodes(node: TextNode): TextNode[] {
    return GraphMethods.nodeChildrenArray(node)
      .filter((node) => node instanceof TextNode)
      .sort((a, b) => a.collisionBox.getRectangle().location.x - b.collisionBox.getRectangle().location.x);
  }

  /**
   * 更改一个TextNode节点的所有子节点名字，如果没有子节点，则新建一个节点
   * @param node
   * @param resultText
   */
  export function getNodeOneResult(node: TextNode, resultText: string) {
    const childrenList = GraphMethods.nodeChildrenArray(node).filter((node) => node instanceof TextNode);
    if (childrenList.length > 0) {
      for (const child of childrenList) {
        child.rename(resultText);
      }
    } else {
      // 新建一个节点生长出去
      const newNode = new TextNode({
        uuid: uuidv4(),
        text: resultText,
        location: [node.collisionBox.getRectangle().location.x, node.collisionBox.getRectangle().location.y + 100],
        size: [100, 100],
        color: [0, 0, 0, 0],
      });
      this.project.stageManager.addTextNode(newNode);
      this.project.stageManager.connectEntity(node, newNode);
    }
  }

  /**
   * 更改一个section节点的所有子节点名字，如果没有子节点，则新建一个节点
   * @param section
   * @param resultText
   */
  export function getSectionOneResult(section: Section, resultText: string) {
    const childrenList = GraphMethods.nodeChildrenArray(section).filter((node) => node instanceof TextNode);
    if (childrenList.length > 0) {
      for (const child of childrenList) {
        child.rename(resultText);
      }
    } else {
      // 新建一个节点生长出去
      const newNode = new TextNode({
        uuid: uuidv4(),
        text: resultText,
        location: [section.collisionBox.getRectangle().location.x, section.collisionBox.getRectangle().bottom + 100],
        size: [100, 100],
        color: [0, 0, 0, 0],
      });
      this.project.stageManager.addTextNode(newNode);
      this.project.stageManager.connectEntity(section, newNode);
    }
  }

  export function getSectionMultiResult(section: Section, resultTextList: string[]) {
    let childrenList = GraphMethods.nodeChildrenArray(section).filter((node) => node instanceof TextNode);
    if (childrenList.length < resultTextList.length) {
      // 子节点数量不够，需要新建节点
      const needCount = resultTextList.length - childrenList.length;
      for (let j = 0; j < needCount; j++) {
        const newNode = new TextNode({
          uuid: uuidv4(),
          text: "",
          location: [
            section.collisionBox.getRectangle().location.x,
            section.collisionBox.getRectangle().bottom + 100 + j * 100,
          ],
          size: [100, 100],
          color: [0, 0, 0, 0],
        });
        this.project.stageManager.addTextNode(newNode);
        this.project.stageManager.connectEntity(section, newNode);
      }
    }
    // 子节点数量够了，直接修改，顺序是从上到下
    childrenList = GraphMethods.nodeChildrenArray(section)
      .filter((node) => node instanceof TextNode)
      .sort(
        (node1, node2) => node1.collisionBox.getRectangle().location.y - node2.collisionBox.getRectangle().location.y,
      );
    // 开始修改
    for (let i = 0; i < resultTextList.length; i++) {
      childrenList[i].rename(resultTextList[i]);
    }
  }

  /**
   * 生成一个节点的多个结果
   * 如果子节点数量不够，则新建节点
   * 如果子节点数量超过，则不修改多余节点
   * @param node
   * @param resultTextList
   */
  export function generateMultiResult(node: TextNode, resultTextList: string[]) {
    if (resultTextList.length === 0) {
      return;
    }
    // 先把子节点数量凑够
    let childrenList = GraphMethods.nodeChildrenArray(node).filter((node) => node instanceof TextNode);
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
        this.project.stageManager.addTextNode(newNode);
        this.project.stageManager.connectEntity(node, newNode);
      }
    }
    // 子节点数量够了，直接修改，顺序是从上到下
    childrenList = GraphMethods.nodeChildrenArray(node)
      .filter((node) => node instanceof TextNode)
      .sort(
        (node1, node2) => node1.collisionBox.getRectangle().location.y - node2.collisionBox.getRectangle().location.y,
      );
    // 开始修改
    for (let i = 0; i < resultTextList.length; i++) {
      childrenList[i].rename(resultTextList[i]);
    }
  }

  /**
   * 将字符串转换为数字
   * @param str
   * @returns
   */
  export function stringToNumber(str: string) {
    if (ProgramFunctions.isHaveVar(str)) {
      return parseFloat(ProgramFunctions.getVarInCore(str));
    }
    return parseFloat(str);
  }

  /**
   * 判断一个节点是否和逻辑节点直接相连
   * 同时判断是否有逻辑节点的父节点或子节点
   * @param node
   */
  export function isNodeConnectedWithLogicNode(node: ConnectableEntity): boolean {
    for (const fatherNode of GraphMethods.nodeParentArray(node)) {
      if (fatherNode instanceof TextNode && isNameIsLogicNode(fatherNode.text)) {
        return true;
      }
    }
    for (const childNode of GraphMethods.nodeChildrenArray(node)) {
      if (childNode instanceof TextNode && isNameIsLogicNode(childNode.text)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断一个节点的名字格式是否符合逻辑节点的格式
   * 1：以#开头，以#结尾，总共只能有两个#
   * 2：中间只有数字、大写字母、下划线
   * @param name
   */
  export function isNameIsLogicNode(name: string): boolean {
    const reg = /^#[a-zA-Z0-9_]+#$/;
    return reg.test(name);
  }
}
