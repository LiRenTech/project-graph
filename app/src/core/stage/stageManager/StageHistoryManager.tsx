import { Serialized } from "../../../types/node";
import { RecentFileManager } from "../../service/dataFileService/RecentFileManager";
import { StageSaveManager } from "../../service/dataFileService/StageSaveManager";
import { Settings } from "../../service/Settings";
import { Stage } from "../Stage";
import { StageDumper } from "../StageDumper";
import { StageManager } from "./StageManager";

/**
 * 专门管理历史记录
 * 负责撤销、反撤销、重做等操作
 * 具有直接更改舞台状态的能力
 *
 * 切换文件，保存时都应该重置
 */
export namespace StageHistoryManager {
  /**
   * 历史记录列表数组
   */
  let historyList: Serialized.File[] = [];
  /**
   * 历史记录列表数组上的一个指针
   */
  let currentIndex = -1;
  /**
   * 数组最大长度
   */
  export let historySize = 20;

  // 在软件启动时调用
  export function init() {
    Settings.watch("historySize", (value) => {
      // 判断是变大还是变小
      if (value < historySize && currentIndex >= value) {
        // 如果变小了，直接重置历史记录列表
        if (historyList.length !== 0) {
          historyList = [historyList[currentIndex]];
          currentIndex = 0;
        }
        historySize = value;
      } else {
        historySize = value;
      }
    });
  }

  export function reset(serializedFile: Serialized.File) {
    historyList = [serializedFile];
    currentIndex = 0;
    StageSaveManager.setIsCurrentSaved(true);
  }

  export function statusText(): string {
    return `当前位置：${currentIndex + 1}/${historyList.length}, max: ${historySize}`;
  }

  /**
   * 记录一步骤
   * @param file
   */
  export function recordStep() {
    historyList.splice(currentIndex + 1);
    // 上面一行的含义：删除从 currentIndex + 1 开始的所有元素。
    // 也就是撤回了好几步之后再做修改，后面的曾经历史就都删掉了，相当于重开了一个分支。
    historyList.push(StageDumper.dump());
    currentIndex++;
    if (historyList.length > historySize) {
      // 数组长度超过最大值时，删除最早的元素
      historyList.shift();
      currentIndex--;
    }
    StageSaveManager.setIsCurrentSaved(false);
  }

  /**
   * 撤销
   */
  export function undo() {
    if (currentIndex > 0) {
      currentIndex--;
      StageManager.destroy();
      RecentFileManager.loadStageByData(historyList[currentIndex], Stage.path.getFilePath());
    }
  }

  /**
   * 反撤销
   */
  export function redo() {
    if (currentIndex < historyList.length - 1) {
      currentIndex++;
      StageManager.destroy();
      RecentFileManager.loadStageByData(historyList[currentIndex], Stage.path.getFilePath());
    }
  }
}
