import { Keyboard, Move, ScanEye, Skull } from "lucide-react";
import { SettingField } from "./_field";

export default function Control() {
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
    </>
  );
}
