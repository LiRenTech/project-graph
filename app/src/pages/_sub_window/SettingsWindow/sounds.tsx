import Github from "@/assets/github.svg?react";
import { Dialog } from "@/components/dialog";
import { SettingField } from "@/components/field";
import { Button } from "@/components/ui/button";
import { PathString } from "@/utils/pathString";
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { exists } from "@tauri-apps/plugin-fs";
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

const SOUND_CONFIGS: { fileName: string; settingKey: keyof Settings.Settings; icon: React.ReactNode }[] = [
  { fileName: "cuttingLineStart.mp3", settingKey: "cuttingLineStartSoundFile", icon: <Scissors /> },
  { fileName: "cuttingLineRelease.mp3", settingKey: "cuttingLineReleaseSoundFile", icon: <ScissorsLineDashed /> },
  { fileName: "connectLineStart.mp3", settingKey: "connectLineStartSoundFile", icon: <ArrowUpFromDot /> },
  { fileName: "connectFindTarget.mp3", settingKey: "connectFindTargetSoundFile", icon: <ArrowDownToDot /> },
  { fileName: "alignAndAttach.mp3", settingKey: "alignAndAttachSoundFile", icon: <AlignStartVertical /> },
  { fileName: "uiButtonEnter.mp3", settingKey: "uiButtonEnterSoundFile", icon: <SquareMousePointer /> },
  { fileName: "uiButtonClick.mp3", settingKey: "uiButtonClickSoundFile", icon: <MousePointerClick /> },
  { fileName: "uiSwitchButtonOn.mp3", settingKey: "uiSwitchButtonOnSoundFile", icon: <ToggleRight /> },
  { fileName: "uiSwitchButtonOff.mp3", settingKey: "uiSwitchButtonOffSoundFile", icon: <ToggleLeft /> },
];

export default function Sounds() {
  const handleClickImportSounds = async () => {
    const folderPath = await openFileDialog({
      title: "打开文件夹",
      directory: true,
      multiple: false,
      filters: [],
    });

    if (folderPath) {
      const pathBuilder = (fileName: string) => `${folderPath}${PathString.getSep()}${fileName}`;

      const checkResults = await Promise.all(
        SOUND_CONFIGS.map(async ({ fileName, settingKey }) => {
          const fullPath = pathBuilder(fileName);
          const fileExists = await exists(fullPath);
          if (fileExists) {
            Settings.set(settingKey, fullPath);
          }
          return { fileName, exists: fileExists };
        }),
      );

      const lostFiles = checkResults.filter(({ exists }) => !exists).map(({ fileName }) => fileName);

      Dialog.show({
        title: "提示",
        content:
          lostFiles.length > 0
            ? `未找到以下${lostFiles.length}个文件：${lostFiles.join(", ")}`
            : `导入成功，已更新${SOUND_CONFIGS.length}个设置`,
        type: lostFiles.length > 0 ? "warning" : "success",
      });
    }
  };

  return (
    <>
      {SOUND_CONFIGS.map(({ icon, settingKey }) => (
        <SettingField key={settingKey} icon={icon} settingKey={settingKey} type="file" />
      ))}
      <div className="flex flex-nowrap gap-2">
        <Button
          tooltip="https://github.com/LiRenTech/project-graph-cdn"
          onClick={() => {
            Dialog.show({
              title: "网页",
              content: "请将下面的内容复制,在浏览器中打开",
              code: "https://github.com/LiRenTech/project-graph-cdn",
            });
          }}
        >
          <Github />
          <span>获取官方音效文件夹</span>
        </Button>
        <Button
          onClick={handleClickImportSounds}
          tooltip="请提前下载官方音效文件夹，并点击此按钮，从本地选择官方音效文件夹"
        >
          从官方音效文件夹导入全部音效
        </Button>
      </div>
    </>
  );
}
