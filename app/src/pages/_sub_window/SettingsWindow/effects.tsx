import { Check, Stars, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ButtonField, Field } from "../../../components/Field";
import Switch from "../../../components/Switch";

const effects = Object.keys(
  import.meta.glob("../../core/service/feedbackService/effectEngine/concrete/*.tsx", {
    eager: true,
  }),
).map((path) => path.replace("../../core/service/feedbackService/effectEngine/concrete/", "").replace(".tsx", ""));

export default function EffectsPage() {
  const { t } = useTranslation("effects");
  const [effectsPerferences, setEffectsPerferences] = Settings.use("effectsPerferences");

  return (
    <>
      <ButtonField
        icon={<Check />}
        title="全开"
        onClick={() => {
          setEffectsPerferences(
            effects.reduce(
              (acc, effectName) => {
                acc[effectName] = true;
                return acc;
              },
              {} as Record<string, boolean>,
            ),
          );
        }}
        label="全开"
      />
      <ButtonField
        icon={<X />}
        title="全关"
        onClick={() => {
          setEffectsPerferences(
            effects.reduce(
              (acc, effectName) => {
                acc[effectName] = false;
                return acc;
              },
              {} as Record<string, boolean>,
            ),
          );
        }}
        label="全关"
      />
      {effects.map((effectName) => (
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
      ))}
    </>
  );
}
