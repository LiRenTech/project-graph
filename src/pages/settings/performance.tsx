import { Sparkles, SquareStack } from "lucide-react";
import { SettingField } from "./_field";

export default function Performance() {
  return (
    <>
      <SettingField
        icon={<Sparkles />}
        settingKey="renderEffect"
        type="switch"
      />
      <SettingField
        icon={<SquareStack />}
        settingKey="historySize"
        type="slider"
        min={10}
        max={1000}
        step={10}
      />
    </>
  );
}
