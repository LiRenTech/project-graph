import { PathString } from "../../../utils/pathString";
import { isWeb } from "../../../utils/platform";
import { Stage } from "../../stage/Stage";
import { StageDumper } from "../../stage/StageDumper";
import { StageSaveManager } from "../../stage/StageSaveManager";
import { Settings } from "../Settings";

/**
 * 自动备份引擎
 */
export class AutoBackupEngine {
  autoBackup: boolean = false;
  autoBackupInterval: number = 30 * 60 * 1000; // 30分钟
  autoBackupDraftPath: string = "";
  private lastAutoBackupTime: number = performance.now();

  init() {
    Settings.watch("autoBackup", (value) => {
      this.autoBackup = value;
    });
    Settings.watch("autoBackupInterval", (value) => {
      this.autoBackupInterval = value * 1000; // s to ms
    });
    Settings.watch("autoBackupDraftPath", (value) => {
      this.autoBackupDraftPath = value;
    });
  }

  public mainTick() {
    // 如果当前是web版本，则禁止自动备份，因为会出现频繁下载文件。
    if (isWeb) {
      return;
    }
    if (!this.autoBackup) {
      return;
    }
    // 自动备份功能
    const now = performance.now();
    if (now - this.lastAutoBackupTime > this.autoBackupInterval) {
      if (Stage.path.isDraft()) {
        const backupPath = `${this.autoBackupDraftPath}${PathString.getSep()}${PathString.getTime()}.json`;
        StageSaveManager.backupHandle(backupPath, StageDumper.dump());
      } else {
        StageSaveManager.backupHandleWithoutCurrentPath(
          StageDumper.dump(),
          false,
        );
      }
      // 更新时间
      this.lastAutoBackupTime = now;
    }
  }
}
