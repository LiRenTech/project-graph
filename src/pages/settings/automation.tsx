import { HardDriveDownload, HardDriveUpload, Tag } from "lucide-react";
import { SettingField } from "./_field";

// 其实应该改成快捷操作相关
export default function AutoNamer() {
  const tipsString = "{{i}}";
  return (
    <>
      <SettingField
        icon={<Tag />}
        settingKey="autoNamerTemplate"
        title={`自动命名模板 *填入${tipsString}，双击创建时可以自动累加数字。`}
        type="text"
        placeholder="例如：p{{i}}"
      />

      <SettingField
        icon={<HardDriveUpload />}
        settingKey="autoOpenPath"
        title="软件启动后自动打开的工程"
        type="text"
        placeholder="注意是绝对路径"
      />

      <SettingField
        icon={<HardDriveDownload />}
        settingKey="autoSaveWhenClose"
        title="点击窗口右上角关闭按钮时自动保存工程文件"
        type="switch"
      />
    </>
  );
}
