import { HardDriveDownload, Tag } from "lucide-react";
import { SettingField } from "./_field";

// 其实应该改成快捷操作相关
export default function AutoNamer() {
  return (
    <>
      <SettingField
        icon={<Tag />}
        settingKey="autoNamerTemplate"
        title={`自动命名模板 `}
        details={[
          "输入`{{i}}` 代表节点名称会自动替换为编号，双击创建时可以自动累加数字。",
          "例如`n{{i}}` 会自动替换为`n1`, `n2`, `n3`...",
          "输入`{{date}}` 会自动替换为当前日期，双击创建时可以自动更新日期。",
          "输入`{{time}}` 会自动替换为当前时间，双击创建时可以自动更新时间。",
          "可以组合使用，例如`{{i}}-{{date}}-{{time}}"
        ]}
        type="text"
        placeholder="例如：p{{i}}"
      />

      {/* <SettingField
        icon={<HardDriveUpload />}
        settingKey="autoOpenPath"
        title="软件启动后自动打开的工程"
        type="text"
        placeholder="注意是绝对路径"
      /> */}

      <SettingField
        icon={<HardDriveDownload />}
        settingKey="autoSaveWhenClose"
        title="点击窗口右上角关闭按钮时自动保存工程文件"
        type="switch"
      />
    </>
  );
}
