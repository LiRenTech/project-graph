import {
  Database,
  Folder,
  HardDrive,
  HardDriveDownload,
  Hourglass,
  Tag,
} from "lucide-react";
import { SettingField } from "./_field";

// 其实应该改成快捷操作相关
export default function AutoNamer() {
  return (
    <>
      <SettingField
        icon={<Tag />}
        settingKey="autoNamerTemplate"
        type="text"
        placeholder="例如：p{{i}}"
      />
      <SettingField
        icon={<Tag />}
        settingKey="autoNamerSectionTemplate"
        type="text"
        placeholder="例如：section{{i}}"
      />
      <SettingField
        icon={<HardDriveDownload />}
        settingKey="autoSaveWhenClose"
        type="switch"
      />
      <SettingField icon={<HardDrive />} settingKey="autoSave" type="switch" />
      <SettingField
        icon={<Hourglass />}
        settingKey="autoSaveInterval"
        type="slider"
        min={1}
        max={60}
        step={1}
      />
      <SettingField icon={<Database />} settingKey="autoBackup" type="switch" />
      <SettingField
        icon={<Hourglass />}
        settingKey="autoBackupInterval"
        type="slider"
        min={60}
        max={6000}
        step={60}
      />
      <SettingField
        icon={<Folder />}
        settingKey="autoBackupDraftPath"
        type="text"
      />
    </>
  );
}
