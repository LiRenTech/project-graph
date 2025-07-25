import {
  Calculator,
  Cpu,
  Hourglass,
  ImageMinus,
  ImageUpscale,
  MemoryStick,
  MonitorPlay,
  RefreshCcwDot,
  ScanEye,
  ScanText,
  Text,
  Turtle,
  Undo,
  Ungroup,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldGroup, SettingField } from "../../../components/Field";

export default function Performance() {
  const { t } = useTranslation("performanceSettingsGroup");

  return (
    <>
      <FieldGroup title={t("memory.title")} description={t("memory.description")} icon={<MemoryStick />}>
        <SettingField icon={<Undo />} settingKey="historySize" type="slider" min={1} max={1000} step={5} />
        <SettingField icon={<ImageMinus />} settingKey="compressPastedImages" type="switch" />
        <SettingField
          icon={<ImageUpscale />}
          settingKey="maxPastedImageSize"
          type="slider"
          min={100}
          max={3840}
          step={50}
        />
      </FieldGroup>

      <FieldGroup title={t("cpu.title")} description={t("cpu.description")} icon={<Cpu />}>
        <SettingField icon={<RefreshCcwDot />} settingKey="autoRefreshStageByMouseAction" type="switch" />
      </FieldGroup>
      <FieldGroup title={t("render.title")} description={t("render.description")} icon={<MonitorPlay />}>
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

        {/* 0.065 */}
        <SettingField
          icon={<ScanText />}
          settingKey="ignoreTextNodeTextRenderLessThanCameraScale"
          type="slider"
          min={0.01}
          max={0.3}
          step={0.01}
        />
        <SettingField icon={<MemoryStick />} settingKey="textCacheSize" type="number" />
        <SettingField icon={<Text />} settingKey="textScalingBehavior" type="select" />
        <SettingField icon={<Calculator />} settingKey="antialiasing" type="select" />
      </FieldGroup>

      <FieldGroup title={t("dev.title")} description={t("dev.description")} icon={<Hourglass />}>
        <SettingField icon={<Turtle />} settingKey="compatibilityMode" type="switch" />
        <SettingField icon={<Ungroup />} settingKey="isEnableEntityCollision" type="switch" />
      </FieldGroup>
    </>
  );
}
