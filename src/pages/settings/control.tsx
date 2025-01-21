import {
  AlignStartVertical,
  Keyboard,
  MousePointerClick,
  Move,
  RotateCw,
  ScanEye,
  Skull,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import KeyBind from "../../components/ui/KeyBind";
import { KeyBinds } from "../../core/service/KeyBinds";
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
        icon={<MousePointerClick />}
        settingKey="mouseRightDragBackground"
        type="select"
      />
      <SettingField
        icon={<AlignStartVertical />}
        settingKey="enableDragAutoAlign"
        type="switch"
      />
      <SettingField
        icon={<ScanEye />}
        settingKey="scaleExponent"
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<ScanEye />}
        settingKey="scaleCameraByMouseLocation"
        type="switch"
      />
      <SettingField
        icon={<Keyboard />}
        settingKey="allowMoveCameraByWSAD"
        type="switch"
      />
      <SettingField
        icon={<Keyboard />}
        settingKey="cameraKeyboardMoveReverse"
        type="switch"
      />
      <SettingField
        icon={<RotateCw />}
        settingKey="allowAddCycleEdge"
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
      <Field icon={<Keyboard />} title={t("title")} color="blue" />
      {keyBinds
        .map(([id, bind]) => (
          <Field
            key={id}
            icon={<Keyboard />}
            title={t(`${id}.title`, { defaultValue: id })}
            description={t(`${id}.description`, { defaultValue: "" })}
          >
            <KeyBind
              value={bind}
              onChange={(value) => {
                KeyBinds.set(id, value.key, value.modifiers);
                setKeyBinds((prev) =>
                  prev.map((item) =>
                    item[0] === id ? [item[0], value] : item,
                  ),
                );
              }}
            />
          </Field>
        ))
        .sort((a, b) => {
          if (a.key === null && b.key === null) return 0; // 两者均为 null，相等
          if (a.key === null) return 1; // a.key 为 null，把它排到后面
          if (b.key === null) return -1; // b.key 为 null，把它排到后面
          return a.key.localeCompare(b.key); // 正常比较
        })}
    </>
  );
}
