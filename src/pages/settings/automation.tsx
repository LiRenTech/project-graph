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
    </>
  );
}
