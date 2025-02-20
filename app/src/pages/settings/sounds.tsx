import {
  AlignStartVertical,
  ArrowDownToDot,
  ArrowUpFromDot,
  MousePointerClick,
  Scissors,
  ScissorsLineDashed,
  SquareMousePointer,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { SettingField } from "./_field";

export default function Sounds() {
  return (
    <>
      <SettingField icon={<Scissors />} settingKey="cuttingLineStartSoundFile" type="file" />
      <SettingField icon={<ScissorsLineDashed />} settingKey="cuttingLineReleaseSoundFile" type="file" />
      <SettingField icon={<ArrowUpFromDot />} settingKey="connectLineStartSoundFile" type="file" />
      <SettingField icon={<ArrowDownToDot />} settingKey="connectFindTargetSoundFile" type="file" />
      <SettingField icon={<AlignStartVertical />} settingKey="alignAndAttachSoundFile" type="file" />
      <SettingField icon={<SquareMousePointer />} settingKey="uiButtonEnterSoundFile" type="file" />
      <SettingField icon={<MousePointerClick />} settingKey="uiButtonClickSoundFile" type="file" />
      <SettingField icon={<ToggleRight />} settingKey="uiSwitchButtonOnSoundFile" type="file" />
      <SettingField icon={<ToggleLeft />} settingKey="uiSwitchButtonOffSoundFile" type="file" />
    </>
  );
}
