import { Stars } from "lucide-react";
import { useTranslation } from "react-i18next";
import Switch from "../../components/ui/Switch";
import { Settings } from "../../core/service/Settings";
import { Field } from "./_field";

export default function EffectsPage() {
  const { t } = useTranslation("effects");
  const [effectsPerferences, setEffectsPerferences] =
    Settings.use("effectsPerferences");

  return Object.keys(
    import.meta.glob("../../core/service/effectEngine/concrete/*.tsx", {
      eager: true,
    }),
  )
    .map((path) =>
      path
        .replace("../../core/service/effectEngine/concrete/", "")
        .replace(".tsx", ""),
    )
    .map((effectName) => (
      <Field
        key={effectName}
        icon={<Stars />}
        title={t(`${effectName}.title`)}
        description={t(`${effectName}.description`)}
      >
        <Switch
          value={effectsPerferences[effectName] ?? true}
          onChange={(value) => {
            setEffectsPerferences({
              ...effectsPerferences,
              [effectName]: value,
            });
          }}
        />
      </Field>
    ));
}
