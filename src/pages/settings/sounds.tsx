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
      <SettingField
        icon={<Folder />}
        settingKey="connectLineStartSoundFile"
        title={"连接线开始音效"}
        details={"右键按下时刚开始创建连接时播放的音效文件。"}
        type="text"
      />
      <SettingField
        icon={<Folder />}
        settingKey="connectFindTargetSoundFile"
        title={"连接线查找目标音效"}
        details={"当"}
        type="text"
      />
      <SettingField
        icon={<Folder />}
        settingKey="cuttingLineReleaseSoundFile"
        title={"切断线释放特效"}
        details={"纯粹解压用的"}
        type="text"
      />
    </>
  );
}
