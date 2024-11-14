import { useTranslation } from "react-i18next";
import { SettingField } from "./_field";
import { Sparkles, SquareStack } from "lucide-react";

export default function Performance() {
  
  const { t } = useTranslation("settingsPerformance");

  return <>
    <SettingField
        icon={<Sparkles />}
        settingKey="renderEffect"
        title={t("renderEffect")}
        type="switch"
      />
    <SettingField
        icon={<SquareStack />}
        settingKey="historySize"
        title={t("historySize.title")}
        details={t("historySize.description")}
        type="slider"
        min={10}
        max={1000}
        step={10}
      />
  </>;
}
