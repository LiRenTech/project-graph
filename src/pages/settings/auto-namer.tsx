import { SettingField } from "./_field";

export default function AutoNamer() {
  const tipsString = "{{i}}"
  return (
    <>
      <SettingField
        settingKey="autoNamerTemplate"
        title="自动命名模板"
        type="text"
      />
      <p>提示：填入 {tipsString}，双击创建时可以自动累加数字。</p>
    </>
  );
}
