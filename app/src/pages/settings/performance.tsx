import { Hourglass, RefreshCcwDot, ScanEye, ScanText, Turtle, Type, Undo, Ungroup } from "lucide-react";
import { SettingField } from "./_field";

export default function Performance() {
  return (
    <>
      <SettingField icon={<Turtle />} settingKey="compatibilityMode" type="switch" />
      <SettingField icon={<Undo />} settingKey="historySize" type="slider" min={10} max={1000} step={10} />
      <SettingField icon={<Ungroup />} settingKey="isEnableEntityCollision" type="switch" />
      <SettingField icon={<ScanEye />} settingKey="scaleExponent" type="slider" min={0} max={1} step={0.1} />
      <SettingField icon={<Type />} settingKey="textIntegerLocationAndSizeRender" type="switch" />
      <SettingField icon={<Hourglass />} settingKey="isPauseRenderWhenManipulateOvertime" type="switch" />
      <SettingField
        icon={<Hourglass />}
        settingKey="renderOverTimeWhenNoManipulateTime"
        type="slider"
        min={0.1}
        max={10}
        step={0.1}
      />

      {/* 0.065 */}
      <SettingField
        icon={<ScanText />}
        settingKey="ignoreTextNodeTextRenderLessThanCameraScale"
        type="slider"
        min={0.01}
        max={0.3}
        step={0.01}
      />
      <SettingField icon={<RefreshCcwDot />} settingKey="autoRefreshStageByMouseAction" type="switch" />
    </>
  );
}
