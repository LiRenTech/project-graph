import { Keyboard, Move, ScanEye, Skull } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import KeyBind from "../../components/ui/KeyBind";
import { KeyBinds } from "../../core/KeyBinds";
import { Field, SettingField } from "./_field";

export default function Control() {
  const [keyBinds, setKeyBinds] = React.useState<
    [id: string, { key: string; modifiers: KeyBinds.KeyModifiers }][]
  >([]);

  React.useEffect(() => {
    KeyBinds.entries().then((entries) => {
      setKeyBinds(entries);
    });
  }, []);

  const { t } = useTranslation("keyBinds");

  return (
    <>
      <SettingField
        icon={<ScanEye />}
        settingKey="scaleExponent"
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Keyboard />}
        settingKey="allowMoveCameraByWSAD"
        type="switch"
      />
      <SettingField
        icon={<Move />}
        settingKey="moveAmplitude"
        type="slider"
        min={0}
        max={10}
        step={0.1}
      />
      <SettingField
        icon={<Move />}
        settingKey="moveFriction"
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Skull />}
        settingKey="gamepadDeadzone"
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      {keyBinds.map(([id, bind]) => (
        <Field key={id} icon={<Keyboard />} title={t(id)} description={id}>
          <KeyBind
            value={bind}
            onChange={(value) => {
              KeyBinds.set(id, value.key, value.modifiers);
              setKeyBinds((prev) =>
                prev.map((item) => (item[0] === id ? [item[0], value] : item)),
              );
            }}
          />
        </Field>
      ))}
    </>
  );
}
