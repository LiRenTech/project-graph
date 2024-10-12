import { Serialized } from "../../../../types/node";
import { RecentFileManager } from "../../../RecentFileManager";
import { StageDumper } from "../../StageDumper";
import { StageManager } from "../StageManager";

/**
 * 专门管理历史记录
 * 负责撤销、反撤销、重做等操作
 * 具有直接更改舞台状态的能力
 */
export namespace StageHistoryManager {
  const historyList: Serialized.File[] = [];
  let currentIndex = -1;

  export function init(file: Serialized.File) {
    historyList.push(file);
    currentIndex = 0;
  }
  export function statusText(): string {
    return `当前位置：${currentIndex + 1}/${historyList.length}`;
  }
  /**
   * 记录一步骤
   * @param file
   */
  export function recordStep() {
    historyList.splice(currentIndex + 1);
    historyList.push(StageDumper.dump());
    currentIndex++;
  }

  /**
   * 撤销
   */
  export function undo() {
    if (currentIndex > 0) {
      currentIndex--;
      StageManager.destroy();
      RecentFileManager.loadStageByData(historyList[currentIndex]);
    }
  }
  /**
   * 反撤销
   */
  export function redo() {
    if (currentIndex < historyList.length - 1) {
      currentIndex++;
      StageManager.destroy();
      RecentFileManager.loadStageByData(historyList[currentIndex]);
    }
  }
}
