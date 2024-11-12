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
        details={
          "输入`{{i}}` 代表节点名称会自动替换为编号，双击创建时可以自动累加数字。\n例如`n{{i}}` 会自动替换为`n1`, `n2`, `n3`...\n输入`{{date}}` 会自动替换为当前日期，双击创建时可以自动更新日期。\n输入`{{time}}` 会自动替换为当前时间，双击创建时可以自动更新时间。\n可以组合使用，例如`{{i}}-{{date}}-{{time}}\n"
        }
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
        details={
          "关闭软件时，如果有未保存的工程文件，会弹出提示框询问是否保存。\n开启此选项后，关闭软件时会自动保存工程文件。\n所以，建议开启此选项。"
        }
        type="switch"
      />
    </>
  );
}
