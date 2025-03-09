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
import { exists } from "../../utils/fs";
import { Dialog } from "../../components/dialog";

export default function Sounds() {
  const handleClickImportSounds = async () => {
    // 打开一个文件夹，识别该文件夹的路径
    const folderPath = await openFileDialog({
      title: "打开文件夹",
      directory: true,
      multiple: false,
      filters: [],
    });
    const p = (fileName: string) => folderPath + PathString.getSep() + fileName;
    if (folderPath) {
      // D:\XX\XXX\project-graph
      // console.log(folderPath);

      const lostFiles = [];
      if (await exists(p("cuttingLineStart.mp3"))) {
        Settings.set("cuttingLineStartSoundFile", p("cuttingLineStart.mp3"));
      } else {
        lostFiles.push("cuttingLineStart.mp3");
      }

      if (await exists(p("cuttingLineRelease.mp3"))) {
        Settings.set("cuttingLineReleaseSoundFile", p("cuttingLineRelease.mp3"));
      } else {
        lostFiles.push("cuttingLineRelease.mp3");
      }
      if (await exists(p("connectLineStart.mp3"))) {
        Settings.set("connectLineStartSoundFile", p("connectLineStart.mp3"));
      } else {
        lostFiles.push("connectLineStart.mp3");
      }
      if (await exists(p("connectFindTarget.mp3"))) {
        Settings.set("connectFindTargetSoundFile", p("connectFindTarget.mp3"));
      } else {
        lostFiles.push("connectFindTarget.mp3");
      }
      if (await exists(p("alignAndAttach.mp3"))) {
        Settings.set("alignAndAttachSoundFile", p("alignAndAttach.mp3"));
      } else {
        lostFiles.push("alignAndAttach.mp3");
      }
      if (await exists(p("uiButtonEnter.mp3"))) {
        Settings.set("uiButtonEnterSoundFile", p("uiButtonEnter.mp3"));
      } else {
        lostFiles.push("uiButtonEnter.mp3");
      }
      if (await exists(p("uiButtonClick.mp3"))) {
        Settings.set("uiButtonClickSoundFile", p("uiButtonClick.mp3"));
      } else {
        lostFiles.push("uiButtonClick.mp3");
      }
      if (await exists(p("uiSwitchButtonOn.mp3"))) {
        Settings.set("uiSwitchButtonOnSoundFile", p("uiSwitchButtonOn.mp3"));
      } else {
        lostFiles.push("uiSwitchButtonOn.mp3");
      }
      if (await exists(p("uiSwitchButtonOff.mp3"))) {
        Settings.set("uiSwitchButtonOffSoundFile", p("uiSwitchButtonOff.mp3"));
      } else {
        lostFiles.push("uiSwitchButtonOff.mp3");
      }
      if (lostFiles.length > 0) {
        Dialog.show({
          title: "提示",
          content: `未找到以下${lostFiles.length}个文件：${lostFiles.join(", ")}`,
          type: "warning",
        });
      } else {
        Dialog.show({
          title: "提示",
          content: "导入成功",
          type: "success",
        });
      }
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
