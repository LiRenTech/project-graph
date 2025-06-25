import { deleteFile, readFolder } from "../../../../utils/fs";
import { PathString } from "../../../../utils/pathString";
import { isWeb } from "../../../../utils/platform";
import { service } from "../../../Project";
import { Stage } from "../../../stage/Stage";
import { StageDumper } from "../../../stage/StageDumper";
import { Settings } from "../../Settings";
import { StageSaveManager } from "../StageSaveManager";

/**
 * 自动备份引擎
 */
@service("autoBackup")
export class AutoBackup {
  autoBackup: boolean = false;
  autoBackupInterval: number = 30 * 60 * 1000; // 30分钟
  autoBackupDraftPath: string = "";
  private lastAutoBackupTime: number = performance.now();
  autoBackupLimitCount: number = 10;

  constructor() {
    Settings.watch("autoBackup", (value) => {
      this.autoBackup = value;
    });
    Settings.watch("autoBackupInterval", (value) => {
      this.autoBackupInterval = value * 1000; // s to ms
    });
    Settings.watch("autoBackupDraftPath", (value) => {
      this.autoBackupDraftPath = value;
    });
    Settings.watch("autoBackupLimitCount", (value) => {
      this.autoBackupLimitCount = value;
    });
  }

  public tick() {
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
        const backupDraftPath = `${this.autoBackupDraftPath}${PathString.getSep()}${PathString.getTime()}.json`;
        StageSaveManager.backupHandle(backupDraftPath, StageDumper.dump(), false);
      } else {
        StageSaveManager.backupHandleWithoutCurrentPath(StageDumper.dump(), false);
        this.limitBackupFilesAndDeleteOld(this.autoBackupLimitCount);
      }
      // 更新时间
      this.lastAutoBackupTime = now;
    }
  }

  /**
   * 获取当前场景对应的备份文件夹路径
   * @returns
   */
  static getBackupFolderPath() {
    const fatherDirPath = PathString.dirPath(Stage.path.getFilePath());
    return `${fatherDirPath}${PathString.getSep()}backup_${PathString.getFileNameFromPath(Stage.path.getFilePath())}`;
  }

  /**
   * 限制备份文件的数量，并删除旧的备份文件
   * @param maxCount
   */
  public async limitBackupFilesAndDeleteOld(maxCount: number) {
    //
    const backupFolderPath = AutoBackup.getBackupFolderPath();
    const backupFiles = (await readFolder(backupFolderPath))
      .map((value) => backupFolderPath + PathString.getSep() + value)
      .filter((value) => value.endsWith(".backup.json"))
      .sort();
    if (backupFiles.length > maxCount) {
      // 开始限制
      for (let i = 0; i < backupFiles.length - maxCount; i++) {
        await deleteFile(backupFiles[i]);
      }
    }
  }
}
