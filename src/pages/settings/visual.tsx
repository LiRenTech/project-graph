import {
  Blend,
  Bug,
  Grid,
  Languages,
  ListCollapse,
  Move,
  ScanEye,
  Spline,
} from "lucide-react";
import { SettingField } from "./_field";
import { useTranslation } from "react-i18next";
import { languages } from "./_languages";

export default function Visual() {
  const { t } = useTranslation("settingsVisual");

  return (
    <>
      <SettingField
        icon={<Languages />}
        settingKey="language"
        title={t("language")}
        type="select"
        options={languages}
      />
      <SettingField
        icon={<Spline />}
        settingKey="lineStyle"
        title={t("lineStyle")}
        type="select"
        options={[
          { label: t("lineStyles.straight"), value: "straight" },
          { label: t("lineStyles.bezier"), value: "bezier" },
          { label: t("lineStyles.vertical"), value: "vertical" },
        ]}
      />
      <SettingField
        icon={<Grid />}
        settingKey="showGrid"
        title={t("showGrid")}
        type="switch"
      />
      <SettingField
        icon={<Blend />}
        settingKey="windowBackgroundAlpha"
        title={t("windowBackgroundAlpha")}
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Bug />}
        settingKey="showDebug"
        title={t("showDebug")}
        type="switch"
      />
      <SettingField
        icon={<ScanEye />}
        settingKey="scaleExponent"
        title={t("scaleExponent")}
        type="slider"
        min={1}
        max={2}
        step={0.1}
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
        min={0}
        max={1}
        step={0.1}
      />
      <SettingField
        icon={<ListCollapse />}
        settingKey="alwaysShowDetails"
        title={t("alwaysShowDetails")}
        type="switch"
      />
    </>
  );
}
