import { useTranslation } from "react-i18next";
import { SettingField } from "./_field";
import { Sparkles } from "lucide-react";

export default function Performance() {
  
  const { t } = useTranslation("settingsPerformance");

  return <>
    <SettingField
        icon={<Sparkles />}
        settingKey="renderEffect"
        title={t("renderEffect")}
        type="switch"
      />
  </>;
}
