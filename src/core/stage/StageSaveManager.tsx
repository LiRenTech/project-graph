import { invoke } from "@tauri-apps/api/core";
import { Serialized } from "../../types/node";
import { ViewFlashEffect } from "../effect/concrete/ViewFlashEffect";
import { Stage } from "./Stage";
import { StageHistoryManager } from "./stageManager/concreteMethods/StageHistoryManager";

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
