import { Serialized } from "../../types/node";
import { exists, writeTextFile } from "../../utils/fs";
import { PathString } from "../../utils/pathString";
import { ViewFlashEffect } from "../service/effect/concrete/ViewFlashEffect";
import { TextNode } from "../stageObject/entity/TextNode";
import { Entity } from "../stageObject/StageObject";
import { Stage } from "./Stage";
import { StageHistoryManager } from "./stageManager/StageHistoryManager";
import { StageManager } from "./stageManager/StageManager";

/**
 * 管理所有和保存相关的内容
 * 包括自动保存
 */
export namespace StageSaveManager {
  /**
   *
   * @param path
   * @param data
   * @param errorCallback
   */
  export async function saveHandle(path: string, data: Serialized.File) {
    await writeTextFile(path, JSON.stringify(data));
    Stage.effects.push(ViewFlashEffect.SaveFile());
    StageHistoryManager.reset(data); // 重置历史
    isCurrentSaved = true;
  }

  /**
   *
   * without path 意思是不需要传入path，直接使用当前的path
   * @param data
   * @param successCallback
   * @param errorCallback
   */
  export async function saveHandleWithoutCurrentPath(
    data: Serialized.File,
    resetHistory = true,
    addFlashEffect = true,
  ) {
    if (Stage.Path.isDraft()) {
      throw new Error("当前文档的状态为草稿，请您先保存为文件");
    }
    await writeTextFile(Stage.Path.getFilePath(), JSON.stringify(data));
    if (addFlashEffect) {
      Stage.effects.push(ViewFlashEffect.SaveFile());
    }
    if (resetHistory) {
      StageHistoryManager.reset(data); // 重置历史
    }
    isCurrentSaved = true;
  }

  /**
   *
   * @param path 备份文件夹/xxx.json
   * @param data
   * @param successCallback
   * @param errorCallback
   * @returns
   */
  export async function backupHandle(path: string, data: Serialized.File) {
    const backupFolderPath = PathString.dirPath(path);
    const isExists = await exists(backupFolderPath);
    if (!isExists) {
      throw new Error("备份文件路径错误:" + backupFolderPath);
    }

    await writeTextFile(path, JSON.stringify(data));
    Stage.effects.push(ViewFlashEffect.SaveFile());
  }
  /**
   * 备份，会在工程文件夹旁白生成一个类似的json文件
   * 可以用于手动触发，也可以自动触发
   * @param data
   * @param successCallback
   * @param errorCallback
   * @param addFlashEffect
   * @returns
   */
  export async function backupHandleWithoutCurrentPath(
    data: Serialized.File,
    addFlashEffect = true,
  ) {
    if (Stage.Path.isDraft()) {
      throw new Error("当前文档的状态为草稿，无法备份");
    }
    // 不能有冒号，空格，斜杠
    const dateTime = PathString.getTime();

    const backupPath = `${Stage.Path.getFilePath()}.${dateTime}.backup`;

    await writeTextFile(backupPath, JSON.stringify(data));
    if (addFlashEffect) {
      Stage.effects.push(ViewFlashEffect.SaveFile());
    }
  }

  /**
   *
   * @param path
   * @param string 已经转换好了的Svg字符串
   */
  export async function saveSvgHandle(path: string, string: string) {
    await writeTextFile(path, string);
    isCurrentSaved = true;
  }

  /**
   * 前置条件已经保证了树形结构
   * @param path
   * @param successCallback
   * @param errorCallback
   */
  export async function saveMarkdownHandle(path: string, textNode: TextNode) {
    const content = getMarkdownStringByTextNode(textNode);
    await writeTextFile(path, content);
  }

  // region 以下可能要拆出去

  /**
   * 格式：
   * 节点A
   * 节点B
   * 节点C
   *
   * A -> B
   * A -> C
   * B -> C
   *
   * @param nodes
   * @returns
   */
  export function getPlainTextByEntities(nodes: Entity[]) {
    let nodesContent = "";
    let linksContent = "";
    for (const node of nodes) {
      if (!(node instanceof TextNode)) {
        continue;
      }
      nodesContent += node.text + "\n";
      if (node.details.trim()) {
        nodesContent += "\t" + node.details + "\n";
      }
      StageManager.nodeChildrenArray(node)
        .filter((node) => node instanceof TextNode)
        .filter((node) => nodes.includes(node))
        .forEach((child) => {
          linksContent += `${node.text} -> ${child.text}\n`;
        });
    }
    return nodesContent + "\n" + linksContent;
  }

  export function getMarkdownStringByTextNode(textNode: TextNode) {
    return getTreeTypeString(textNode, getNodeMarkdown);
  }

  export function getTabStringByTextNode(textNode: TextNode) {
    return getTreeTypeString(textNode, getTabText);
  }

  function getTreeTypeString(
    textNode: TextNode,
    nodeToStringFunc: (node: TextNode, level: number) => string,
  ) {
    let content = "";
    const visitedUUID = new Set<string>();

    const dfs = (node: TextNode, level: number) => {
      if (visitedUUID.has(node.uuid)) {
        return;
      }
      visitedUUID.add(node.uuid);
      content += nodeToStringFunc(node, level);
      const children = StageManager.nodeChildrenArray(node).filter(
        (v) => v instanceof TextNode,
      );
      for (const child of children) {
        dfs(child, level + 1);
      }
    };

    dfs(textNode, 1);
    return content;
  }

  function getNodeMarkdown(node: TextNode, level: number): string {
    let stringResult = "";
    if (level < 6) {
      stringResult += `${"#".repeat(level)} ${node.text}\n\n`;
    } else {
      stringResult += `**${node.text}**\n\n`;
    }
    if (node.details.trim()) {
      stringResult += `${node.details}\n\n`;
    }
    return stringResult;
  }

  function getTabText(node: TextNode, level: number): string {
    let stringResult = "";
    stringResult += `${"\t".repeat(Math.max(level - 1, 0))}${node.text}\n`;
    if (node.details.trim()) {
      stringResult += `${"\t".repeat(level)}${node.details}\n`;
    }
    return stringResult;
  }

  // region 自动保存相关

  let isCurrentSaved = true;

  export function setIsCurrentSaved(saved: boolean) {
    isCurrentSaved = saved;
  }

  /**
   * 当前是否有保存
   * @returns
   */
  export function isSaved() {
    return isCurrentSaved;
  }

  export function openAutoSave() {}

  export function closeAutoSave() {}
}
