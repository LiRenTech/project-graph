import {
  AppWindowMac,
  Blend,
  Bug,
  Grid,
  Languages,
  ListCollapse,
  Spline,
  VenetianMask,
  Palette
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
        icon={<Palette />}
        settingKey="theme"
        title={t("theme")}
        type="select"
        options={[
          { label: t("themes.black"), value: "black" },
          { label: t("themes.white"), value: "white" },
        ]}
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
        title={t("showDebug.title")}
        details={
          t("showDebug.description")
        }
        type="switch"
      />
      <SettingField
        icon={<VenetianMask />}
        settingKey="protectingPrivacy"
        title={t("protectingPrivacy.title")}
        details={
          t("protectingPrivacy.description")
        }
        type="switch"
      />

      <SettingField
        icon={<ListCollapse />}
        settingKey="alwaysShowDetails"
        title={t("alwaysShowDetails.title")}
        details={t("alwaysShowDetails.description")}
        type="switch"
      />
      <SettingField
        icon={<AppWindowMac />}
        settingKey="useNativeTitleBar"
        title={t("useNativeTitleBar.title")}
        details={t("useNativeTitleBar.description")}
        type="switch"
      />
    </>
  );
}
