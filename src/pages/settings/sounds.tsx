import { Folder } from "lucide-react";
import { SettingField } from "./_field";

export default function Sounds() {
  return (
    <>
      <p>
        注意：有的音频文件有可能会解码失败，如果路径正确但没有播放音效说明解码失败了，建议多测试一些音频文件。
      </p>
      <SettingField
        icon={<Folder />}
        settingKey="cuttingLineStartSoundFile"
        type="file"
      />
      <SettingField
        icon={<Folder />}
        settingKey="connectLineStartSoundFile"
        type="file"
      />
      <SettingField
        icon={<Folder />}
        settingKey="connectFindTargetSoundFile"
        type="file"
      />
      <SettingField
        icon={<Folder />}
        settingKey="cuttingLineReleaseSoundFile"
        type="file"
      />
      <SettingField
        icon={<Folder />}
        settingKey="alignAndAttachSoundFile"
        type="file"
      />
    </>
  );
}
