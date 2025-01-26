import { v4 as uuidv4 } from "uuid";
import {
  MarkdownNode,
  parseMarkdownToJSON,
} from "../../../../utils/markdownParse";
import { MonoStack } from "../../../dataStruct/MonoStack";
import { ProgressNumber } from "../../../dataStruct/ProgressNumber";
import { Vector } from "../../../dataStruct/Vector";
import { RectanglePushInEffect } from "../../../service/feedbackService/effectEngine/concrete/RectanglePushInEffect";
import { Settings } from "../../../service/Settings";
import { Stage } from "../../Stage";
import { ConnectPoint } from "../../stageObject/entity/ConnectPoint";
import { Section } from "../../stageObject/entity/Section";
import { TextNode } from "../../stageObject/entity/TextNode";
import { StageManager } from "../StageManager";
import { StageManagerUtils } from "./StageManagerUtils";

/**
 * 包含增加节点的方法
 * 有可能是用鼠标增加，涉及自动命名器
 * 也有可能是用键盘增加，涉及快捷键和自动寻找空地
 */
export namespace StageNodeAdder {
  /**
   * 通过点击位置增加节点
   * @param clickWorldLocation
   * @returns
   */
  export async function addTextNodeByClick(
    clickWorldLocation: Vector,
    addToSections: Section[],
    selectCurrent = false,
  ): Promise<string> {
    const newUUID = uuidv4();
    const node = new TextNode({
      uuid: newUUID,
      text: await getAutoName(),
      details: "",
      location: [clickWorldLocation.x, clickWorldLocation.y],
      size: [100, 100],
    });
    // 将node本身向左上角移动，使其居中
    node.moveTo(
      node.rectangle.location.subtract(node.rectangle.size.divide(2)),
    );
    StageManager.addTextNode(node);

    for (const section of addToSections) {
      section.children.push(node);
      section.adjustLocationAndSize();
      Stage.effectMachine.addEffect(
        new RectanglePushInEffect(
          node.rectangle.clone(),
          section.rectangle.clone(),
          new ProgressNumber(0, 100),
        ),
      );
    }
    // 处理选中问题
    if (selectCurrent) {
      for (const otherNode of StageManager.getTextNodes()) {
        if (otherNode.isSelected) {
          otherNode.isSelected = false;
        }
      }
      node.isSelected = true;
    }
    return newUUID;
  }

  /**
   * 在当前已经选中的某个节点的情况下，增加节点
   * 增加在某个选中的节点的上方，下方，左方，右方等位置
   * @param selectCurrent
   * @returns
   */
  export async function addTextNodeFromCurrentSelectedNode(
    distanceLocation: Vector,
    addToSections: Section[],
    selectCurrent = false,
  ): Promise<string> {
    // 先检查当前是否有选中的唯一实体
    const selectedEntities = StageManager.getSelectedEntities();
    if (selectedEntities.length !== 1) {
      // 未选中或选中多个
      return "";
    }
    const selectedEntity = selectedEntities[0];
    const entityRectangle = selectedEntity.collisionBox.getRectangle();
    return await addTextNodeByClick(
      entityRectangle.center.add(distanceLocation),
      addToSections,
      selectCurrent,
    );
  }

  async function getAutoName(): Promise<string> {
    let template = await Settings.get("autoNamerTemplate");
    template = StageManagerUtils.replaceAutoNameTemplate(
      template,
      StageManager.getTextNodes()[0],
    );
    return template;
  }

  export function addConnectPoint(
    clickWorldLocation: Vector,
    addToSections: Section[],
  ): string {
    const newUUID = uuidv4();
    const connectPoint = new ConnectPoint({
      uuid: newUUID,
      location: [clickWorldLocation.x, clickWorldLocation.y],
    });
    StageManager.addConnectPoint(connectPoint);
    for (const section of addToSections) {
      section.children.push(connectPoint);
      section.adjustLocationAndSize();
      Stage.effectMachine.addEffect(
        new RectanglePushInEffect(
          connectPoint.collisionBox.getRectangle(),
          section.rectangle.clone(),
          new ProgressNumber(0, 100),
        ),
      );
    }
    return newUUID;
  }

  /**
   * 通过带有缩进格式的文本来增加节点
   */
  export function addNodeByText(
    text: string,
    indention: number,
    diffLocation: Vector = Vector.getZero(),
  ) {
    // 将本文转换成字符串数组，按换行符分割
    const lines = text.split("\n");

    const rootUUID = uuidv4();

    // 准备好栈和根节点
    const rootNode = new TextNode({
      uuid: rootUUID,
      text: "root",
      details: "",
      location: [diffLocation.x, diffLocation.y],
      size: [100, 100],
    });
    const nodeStack = new MonoStack<TextNode>();
    nodeStack.push(rootNode, -1);
    StageManager.addTextNode(rootNode);
    // 遍历每一行
    for (let yIndex = 0; yIndex < lines.length; yIndex++) {
      const line = lines[yIndex];
      // 跳过空行
      if (line.trim() === "") {
        continue;
      }
      // 解析缩进格式
      const indent = getIndentLevel(line, indention);
      // 解析文本内容
      const textContent = line.trim();

      const newUUID = uuidv4();
      const node = new TextNode({
        uuid: newUUID,
        text: textContent,
        details: "",
        location: [indent * 50 + diffLocation.x, yIndex * 100 + diffLocation.y],
        size: [100, 100],
      });
      StageManager.addTextNode(node);

      // 检查栈
      // 保持一个严格单调栈
      if (nodeStack.peek()) {
        nodeStack.push(node, indent);
        const fatherNode = nodeStack.unsafeGet(nodeStack.length - 2);
        StageManager.connectEntity(fatherNode, node);
      }
    }
  }

  /***
   * 'a' -> 0
   * '    a' -> 1
   * '\t\ta' -> 2
   */
  function getIndentLevel(line: string, indention: number): number {
    let indent = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === " ") {
        indent++;
      } else if (line[i] === "\t") {
        indent += indention;
      } else {
        break;
      }
    }
    return Math.floor(indent / indention);
  }

  export function addNodeByMarkdown(
    markdownText: string,
    diffLocation: Vector = Vector.getZero(),
  ) {
    const markdownJson = parseMarkdownToJSON(markdownText);
    // 遍历markdownJson
    const dfsMarkdownNode = (markdownNode: MarkdownNode, deepLevel: number) => {
      // visit
      visitFunction(markdownNode, deepLevel);
      // visited
      for (const child of markdownNode.children) {
        dfsMarkdownNode(child, deepLevel + 1);
      }
    };
    const monoStack = new MonoStack<TextNode>();
    monoStack.push(
      new TextNode({
        uuid: uuidv4(),
        text: "root",
        details: "",
        location: [diffLocation.x, diffLocation.y],
        size: [100, 100],
      }),
      -1,
    );

    let visitedCount = 0;

    const visitFunction = (markdownNode: MarkdownNode, deepLevel: number) => {
      visitedCount++;
      const newUUID = uuidv4();
      const node = new TextNode({
        uuid: newUUID,
        text: markdownNode.title,
        details: markdownNode.content,
        location: [
          diffLocation.x + deepLevel * 50,
          diffLocation.y + visitedCount * 100,
        ],
        size: [100, 100],
      });
      StageManager.addTextNode(node);
      monoStack.push(node, deepLevel);
      // 连接父节点
      const fatherNode = monoStack.unsafeGet(monoStack.length - 2);
      StageManager.connectEntity(fatherNode, node);
    };

    dfsMarkdownNode(markdownJson[0], 0);
  }
}
