import { Folder } from "lucide-react";
import { SettingField } from "./_field";

export default function Sounds() {
  return (
    <>
      <SettingField
        icon={<Folder />}
        settingKey="cuttingLineStartSoundFile"
        title={"切割线开始音效"}
        details={"右键按下时刚开始创建切割线准备切割东西时播放的音效文件。"}
        type="text"
      />
    </>
  );
}
