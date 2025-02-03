import { Serialized } from "../../../types/node";
import { exists, writeTextFile } from "../../../utils/fs/com";
import { PathString } from "../../../utils/pathString";
import { Stage } from "../../stage/Stage";
import { StageHistoryManager } from "../../stage/stageManager/StageHistoryManager";
import { ViewFlashEffect } from "../feedbackService/effectEngine/concrete/ViewFlashEffect";
import { VFileSystem } from "./VFileSystem";

/**
 * 管理所有和保存相关的内容
 */
export namespace StageSaveManager {
  /**
   *
   * @param path
   * @param data
   * @param errorCallback
   */
  export async function saveHandle(path: string, data: Serialized.File) {
    await VFileSystem.saveToPath(path);
    Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
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
    if (Stage.path.isDraft()) {
      throw new Error("当前文档的状态为草稿，请您先保存为文件");
    }
    await VFileSystem.saveToPath(Stage.path.getFilePath());
    if (addFlashEffect) {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
    }
    if (resetHistory) {
      StageHistoryManager.reset(data); // 重置历史
    }
    isCurrentSaved = true;
  }

  /**
   *
   * @param path 备份文件夹/xxx.json
   * @param _data
   * @param successCallback
   * @param errorCallback
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export async function backupHandle(path: string, _data: Serialized.File) {
    const backupFolderPath = PathString.dirPath(path);
    const isExists = await exists(backupFolderPath);
    if (!isExists) {
      throw new Error("备份文件路径错误:" + backupFolderPath);
    }

    await VFileSystem.saveToPath(path);
    Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
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
  export async function backupHandleWithoutCurrentPath(data: Serialized.File, addFlashEffect = true) {
    if (Stage.path.isDraft()) {
      throw new Error("当前文档的状态为草稿，无法备份");
    }
    // 不能有冒号，空格，斜杠
    const dateTime = PathString.getTime();

    const backupPath = `${Stage.path.getFilePath()}.${dateTime}.backup`;

    await writeTextFile(backupPath, JSON.stringify(data));
    if (addFlashEffect) {
      Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
    }
  }

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
}
