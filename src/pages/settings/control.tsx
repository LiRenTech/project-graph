import { Move, ScanEye, Skull } from "lucide-react";
import { SettingField } from "./_field";
import { useTranslation } from "react-i18next";

export default function Control() {
  const { t } = useTranslation("settingsControl");

  return (
    <>
      <SettingField
        icon={<ScanEye />}
        settingKey="scaleExponent"
        title={t("scaleExponent")}
        type="slider"
        min={0.01}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Move />}
        settingKey="moveAmplitude"
        title={t("moveAmplitude")}
        type="slider"
        min={0}
        max={10}
        step={0.1}
      />
      <SettingField
        icon={<Move />}
        settingKey="moveFriction"
        title={t("moveFriction")}
        type="slider"
        min={0.01}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Skull />}
        settingKey="gamepadDeadzone"
        title={t("gamepadDeadzone")}
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
    </>
  );
}
