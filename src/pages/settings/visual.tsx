import {
  AppWindowMac,
  Blend,
  Bug,
  Grid,
  Languages,
  ListCollapse,
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
        details={["通常为开发者使用", "开启后，画布左上角将会显示调试信息。", "若您遇到bug截图反馈时，建议开启此选项。"]}
        type="switch"
      />

      <SettingField
        icon={<ListCollapse />}
        settingKey="alwaysShowDetails"
        title={t("alwaysShowDetails")}
        details={["开启后，无需鼠标移动到节点上时，才显示节点的详细信息。"]}
        type="switch"
      />
      <SettingField
        icon={<AppWindowMac />}
        settingKey="useNativeTitleBar"
        title={t("useNativeTitleBar")}
        details={["开启后，窗口顶部将会出现原生的标题栏，而不是模拟的标题栏。"]}
        type="switch"
      />
    </>
  );
}
