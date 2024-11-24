import {
  HardDriveDownload,
  Tag,
  Database,
  Hourglass,
  HardDrive,
  Folder
} from "lucide-react";
import { SettingField } from "./_field";
import { useTranslation } from "react-i18next";

// 其实应该改成快捷操作相关
export default function AutoNamer() {
  const { t } = useTranslation("settingsAutomation");

  return (
    <>
      <SettingField
        icon={<Tag />}
        settingKey="autoNamerTemplate"
        title={t("autoNamerTemplate.title")}
        details={t("autoNamerTemplate.description")}
        type="text"
        placeholder="例如：p{{i}}"
      />
      <SettingField
        icon={<HardDriveDownload />}
        settingKey="autoSaveWhenClose"
        title={t("autoSaveWhenClose.title")}
        details={t("autoSaveWhenClose.description")}
        type="switch"
      />
      <SettingField
        icon={<HardDrive />}
        settingKey="autoSave"
        title={"开启自动保存"}
        details={
          "自动保存当前文件\n此功能目前仅对已有路径的文件有效，不对草稿文件生效！"
        }
        type="switch"
      />
      <SettingField
        icon={<Hourglass />}
        settingKey="autoSaveInterval"
        title={"开启自动保存间隔（秒）"}
        details={"自动保存过于频繁可能会对机械型硬盘造成压力\n进而降低硬盘寿命"}
        type="slider"
        min={1}
        max={60}
        step={1}
      />
      <SettingField
        icon={<Database />}
        settingKey="autoBackup"
        title={"开启自动备份"}
        details={
          "自动备份当前文件\n自动备份会在工程文件旁边生成一个副本\n如果是草稿，则会存储在指定的路径"
        }
        type="switch"
      />
      <SettingField
        icon={<Hourglass />}
        settingKey="autoBackupInterval"
        title={"开启自动备份间隔（秒）"}
        details={"自动备份过于频繁可能会产生大量的备份文件\n进而占用磁盘空间"}
        type="slider"
        min={60}
        max={6000}
        step={60}
      />
      <SettingField
        icon={<Folder />}
        settingKey="autoBackupDraftPath"
        title={"草稿的自动备份文件夹路径"}
        details={
          "请填写绝对路径，草稿将统一备份到此文件夹下\n留空或路径错误时不进行备份\nwindows系统注意使用反斜杠\n例如：C:\\Users\\username\\Documents\\DraftBackup\n结尾不要带路径分隔符"
        }
        type="text"
      />
    </>
  );
}
