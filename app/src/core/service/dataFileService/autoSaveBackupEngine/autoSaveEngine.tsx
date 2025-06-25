import { isWeb } from "../../../../utils/platform";
import { Project, service } from "../../../Project";
import { Stage } from "../../../stage/Stage";
import { StageDumper } from "../../../stage/StageDumper";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { Settings } from "../../Settings";
import { StageSaveManager } from "../StageSaveManager";

/**
 * 自动保存功能
 */
@service("autoSave")
export class AutoSave {
  private lastAutoSaveTime = performance.now();
  private autoSaveInterval = 10 * 1000; // 10s
  private autoSave = true;
  /**
   * 自动保存是否处于暂停状态
   * 主要用于防止自动保存出bug，产生覆盖文件的问题
   */
  private isAutoSavePaused = false;

  public setAutoSavePaused(isPaused: boolean) {
    this.isAutoSavePaused = isPaused;
  }

  public toString() {
    return `isAutoSavePaused: ${this.isAutoSavePaused}, autoSaveInterval: ${this.autoSaveInterval}, autoSave: ${this.autoSave}`;
  }

  constructor(private readonly project: Project) {
    // 注册事件
    Settings.watch("autoSaveInterval", (value) => {
      this.autoSaveInterval = value * 1000; // s to ms
    });
    Settings.watch("autoSave", (value) => {
      this.autoSave = value;
    });
  }

  tick() {
    if (isWeb) {
      // 自动保存功能暂时不支持web端
      return;
    }
    if (!this.autoSave) {
      return;
    }
    if (this.isAutoSavePaused) {
      return;
    }
    // 自动保存功能
    const now = performance.now();
    if (now - this.lastAutoSaveTime > this.autoSaveInterval) {
      if (Stage.path.isDraft()) {
        // 自动保存无法对草稿进行，因为草稿没有路径
      } else {
        // 特殊情况，如果没有节点，则不保存

        if (StageManager.getTextNodes().length === 0) {
          // 没有节点，不保存
        } else {
          // 不要顶部白线提醒了。——joe以为是bug
          StageSaveManager.saveHandleWithoutCurrentPath(StageDumper.dump(), false);
          // 更新时间
        }
      }
      this.lastAutoSaveTime = now;
    }
  }
}
