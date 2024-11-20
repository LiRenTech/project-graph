import { HardDriveDownload, Tag } from "lucide-react";
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
        icon={<HardDriveDownload />}
        settingKey="autoSave"
        title={"开启自动保存"}
        details={"自动保存当前文件，此功能仅对已有路径的文件有效，不对草稿文件生效！"}
        type="switch"
      />
      <SettingField
        icon={<HardDriveDownload />}
        settingKey="autoSaveInterval"
        title={"开启自动保存间隔（秒）"}
        details={"自动保存过于频繁可能会对机械磁盘造成压力"}
        type="slider"
        min={1}
        max={60}
        step={1}
      />
    </>
  );
}
