import {
  HardDriveDownload,
  Tag,
  Database,
  Hourglass,
  HardDrive,
  Folder,
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
        title={t("autoSave.title")}
        details={t("autoSave.description")}
        type="switch"
      />
      <SettingField
        icon={<Hourglass />}
        settingKey="autoSaveInterval"
        title={t("autoSaveInterval.title")}
        details={t("autoSaveInterval.description")}
        type="slider"
        min={1}
        max={60}
        step={1}
      />
      <SettingField
        icon={<Database />}
        settingKey="autoBackup"
        title={t("autoBackup.title")}
        details={t("autoBackup.description")}
        type="switch"
      />
      <SettingField
        icon={<Hourglass />}
        settingKey="autoBackupInterval"
        title={t("autoBackupInterval.title")}
        details={t("autoBackupInterval.description")}
        type="slider"
        min={60}
        max={6000}
        step={60}
      />
      <SettingField
        icon={<Folder />}
        settingKey="autoBackupDraftPath"
        title={t("autoBackupDraftPath.title")}
        details={t("autoBackupDraftPath.description")}
        type="text"
      />
    </>
  );
}
