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
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { SettingField } from "./_field";
import Button from "../../components/Button";
import { Settings } from "../../core/service/Settings";
import { PathString } from "../../utils/pathString";

export default function Sounds() {
  const handleClickImportSounds = async () => {
    // 打开一个文件夹，识别该文件夹的路径
    const folderPath = await openFileDialog({
      title: "打开文件夹",
      directory: true,
      multiple: false,
      filters: [],
    });
    if (folderPath) {
      console.log(folderPath);
      // D:\XX\XXX\project-graph
      Settings.set("cuttingLineStartSoundFile", folderPath + PathString.getSep() + "cuttingLineStart.mp3");
      Settings.set("cuttingLineReleaseSoundFile", folderPath + PathString.getSep() + "cuttingLineRelease.mp3");
      Settings.set("connectLineStartSoundFile", folderPath + PathString.getSep() + "connectLineStart.mp3");
      Settings.set("connectFindTargetSoundFile", folderPath + PathString.getSep() + "connectFindTarget.mp3");
      Settings.set("alignAndAttachSoundFile", folderPath + PathString.getSep() + "alignAndAttach.mp3");
      Settings.set("uiButtonEnterSoundFile", folderPath + PathString.getSep() + "uiButtonEnter.mp3");
      Settings.set("uiButtonClickSoundFile", folderPath + PathString.getSep() + "uiButtonClick.mp3");
      Settings.set("uiSwitchButtonOnSoundFile", folderPath + PathString.getSep() + "uiSwitchButtonOn.mp3");
      Settings.set("uiSwitchButtonOffSoundFile", folderPath + PathString.getSep() + "uiSwitchButtonOff.mp3");
    }
  };

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
      <Button onClick={handleClickImportSounds}>一键导入官方音效</Button>
    </>
  );
}
