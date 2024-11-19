import { Keyboard, Move, ScanEye, Skull } from "lucide-react";
import { SettingField } from "./_field";
import { useTranslation } from "react-i18next";

export default function Control() {
  const { t } = useTranslation("settingsControl");

  return (
    <>
      <SettingField
        icon={<ScanEye />}
        settingKey="scaleExponent"
        title={t("scaleExponent.title")}
        details={t("scaleExponent.description")}
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Keyboard />}
        settingKey="allowMoveCameraByWSAD"
        title={"允许使用“WSAD”键来控制视角移动"}
        details={"WSAD"}
        type="switch"
      />
      <SettingField
        icon={<Move />}
        settingKey="moveAmplitude"
        title={t("moveAmplitude.title")}
        details={t("moveAmplitude.description")}
        type="slider"
        min={0}
        max={10}
        step={0.1}
      />
      <SettingField
        icon={<Move />}
        settingKey="moveFriction"
        title={t("moveFriction.title")}
        details={t("moveFriction.description")}
        type="slider"
        min={0}
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
