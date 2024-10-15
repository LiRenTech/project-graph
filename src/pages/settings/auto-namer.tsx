import { SettingField } from "./_field";

// 其实应该改成快捷操作相关
export default function AutoNamer() {
  const tipsString = "{{i}}"
  return (
    <>
      <SettingField
        settingKey="autoNamerTemplate"
        title="自动命名模板"
        type="text"
        placeholder="例如：p{{i}}"
      />
      
      <p>提示：填入 {tipsString}，双击创建时可以自动累加数字。</p>

      <SettingField
        settingKey="autoOpenPath"
        title="软件启动后自动打开的工程"
        type="text"
        placeholder="注意是绝对路径"
      />
    </>
  );
}
