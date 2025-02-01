import { Undo, Ungroup } from "lucide-react";
import { SettingField } from "./_field";

export default function Performance() {
  return (
    <>
      <SettingField icon={<Undo />} settingKey="historySize" type="slider" min={10} max={1000} step={10} />
      <SettingField icon={<Ungroup />} settingKey="isEnableEntityCollision" type="switch" />
    </>
  );
}
