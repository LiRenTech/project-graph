import { invoke } from "@tauri-apps/api/core";
import { Serialized } from "../../types/node";
import { ViewFlashEffect } from "../effect/concrete/ViewFlashEffect";
import { Stage } from "./Stage";
import { StageHistoryManager } from "./stageManager/concreteMethods/StageHistoryManager";
import { TextNode } from "../stageObject/entity/TextNode";
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
  export function saveHandle(
    path: string,
    data: Serialized.File,
    successCallback: () => void,
    errorCallback: (err: any) => void,
  ) {
    invoke<string>("save_json_by_path", {
      path,
      content: JSON.stringify(data, null, 2),
    })
      .then((res) => {
        console.log(res);
        Stage.effects.push(ViewFlashEffect.SaveFile());
        StageHistoryManager.init(data); // 重置历史
        successCallback();
        isCurrentSaved = true;
      })
      .catch((err) => {
        errorCallback(err);
      });
  }

  export function saveSvgHandle(
    path: string,
    string: string,
    successCallback: () => void,
    errorCallback: (err: any) => void,
  ) {
    invoke<string>("save_json_by_path", {
      path,
      content: string,
    })
      .then((res) => {
        console.log(res);
        successCallback();
        isCurrentSaved = true;
      })
      .catch((err) => {
        errorCallback(err);
      });
  }

  /**
   * 前置条件已经保证了树形结构
   * @param path
   * @param successCallback
   * @param errorCallback
   */
  export function saveMarkdownHandle(
    path: string,
    textNode: TextNode,
    successCallback: () => void,
    errorCallback: (err: any) => void,
  ) {
    let content = "";
    const visitedUUID = new Set<string>();

    const getNodeMarkdown = (node: TextNode, level: number) => {
      let stringResult = "";
      if (level < 6) {
        stringResult += `${"#".repeat(level)} ${node.text}\n\n`;
      } else {
        stringResult += `**${node.text}**\n\n`;
      }
      stringResult += `${node.details}\n\n`;
      return stringResult;
    };

    const dfs = (node: TextNode, level: number) => {
      if (visitedUUID.has(node.uuid)) {
        return;
      }
      visitedUUID.add(node.uuid);
      content += getNodeMarkdown(node, level);
      const children = StageManager.nodeChildrenArray(textNode).filter(
        (v) => v instanceof TextNode,
      );
      console.log(node.text, children);  // BUG: 这里的children有问题，不全
      children.forEach((child) => {
        dfs(child, level + 1);
      });
    };

    dfs(textNode, 1);

    invoke<string>("save_json_by_path", {
      path,
      content,
    })
      .then((res) => {
        console.log(res);
        successCallback();
      })
      .catch((err) => {
        errorCallback(err);
      });
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
