import { Serialized } from "../../../types/node";
import { createFolder, exists, writeTextFile } from "../../../utils/fs";
import { PathString } from "../../../utils/pathString";
import { Stage } from "../../stage/Stage";
import { StageHistoryManager } from "../../stage/stageManager/StageHistoryManager";
import { ViewFlashEffect } from "../feedbackService/effectEngine/concrete/ViewFlashEffect";

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
    await writeTextFile(path, JSON.stringify(data));
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
    await writeTextFile(Stage.path.getFilePath(), JSON.stringify(data));
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
    Stage.effectMachine.addEffect(ViewFlashEffect.SaveFile());
  }
  /**
   * 备份，会在工程文件夹的内部新建一个backup文件夹，并在里面生成一个类似的json文件
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
    const fatherDirPath = PathString.dirPath(Stage.path.getFilePath());
    const backupFolderPath = `${fatherDirPath}${PathString.getSep()}backup_${PathString.getFileNameFromPath(Stage.path.getFilePath())}`;
    if (!(await exists(backupFolderPath))) {
      const created = await createFolder(backupFolderPath);
      if (!created) {
        throw new Error("创建备份文件夹失败" + backupFolderPath);
      }
    }
    const backupPath = `${backupFolderPath}${PathString.getSep()}${dateTime}.backup.json`;

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
