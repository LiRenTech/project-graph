import {
  Cpu,
  Hourglass,
  MemoryStick,
  MonitorPlay,
  RefreshCcwDot,
  ScanEye,
  ScanText,
  Turtle,
  Type,
  Undo,
  Ungroup,
} from "lucide-react";
import { FieldGroup, SettingField } from "./_field";

export default function Performance() {
  return (
    <>
      <FieldGroup title="Memory 内存" description="以下选项和设备内存相关" icon={<MemoryStick />}>
        <SettingField icon={<Undo />} settingKey="historySize" type="slider" min={10} max={1000} step={10} />
      </FieldGroup>

      <FieldGroup title="CPU 处理器" description="以下选项和设备处理器相关" icon={<Cpu />}>
        <SettingField icon={<RefreshCcwDot />} settingKey="autoRefreshStageByMouseAction" type="switch" />
      </FieldGroup>
      <FieldGroup title="Render 画面渲染" description="以下选项和设备的显卡/核显/屏幕刷新率相关" icon={<MonitorPlay />}>
        <SettingField icon={<Hourglass />} settingKey="isPauseRenderWhenManipulateOvertime" type="switch" />
        <SettingField
          icon={<Hourglass />}
          settingKey="renderOverTimeWhenNoManipulateTime"
          type="slider"
          min={0.1}
          max={10}
          step={0.1}
        />
        <SettingField icon={<ScanEye />} settingKey="scaleExponent" type="slider" min={0} max={1} step={0.1} />
        <SettingField icon={<Type />} settingKey="textIntegerLocationAndSizeRender" type="switch" />

        {/* 0.065 */}
        <SettingField
          icon={<ScanText />}
          settingKey="ignoreTextNodeTextRenderLessThanCameraScale"
          type="slider"
          min={0.01}
          max={0.3}
          step={0.01}
        />
      </FieldGroup>

      <FieldGroup
        title="开发中 Developing..."
        description="功能正在开发中，可能存在一些问题，请谨慎使用。"
        icon={<Hourglass />}
      >
        <SettingField icon={<Turtle />} settingKey="compatibilityMode" type="switch" />
        <SettingField icon={<Ungroup />} settingKey="isEnableEntityCollision" type="switch" />
      </FieldGroup>
    </>
  );
}
