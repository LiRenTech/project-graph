import { Folder } from "lucide-react";
import { SettingField } from "./_field";

export default function Sounds() {
  return (
    <>
      <SettingField icon={<Folder />} settingKey="cuttingLineStartSoundFile" type="file" />
      <SettingField icon={<Folder />} settingKey="connectLineStartSoundFile" type="file" />
      <SettingField icon={<Folder />} settingKey="connectFindTargetSoundFile" type="file" />
      <SettingField icon={<Folder />} settingKey="cuttingLineReleaseSoundFile" type="file" />
      <SettingField icon={<Folder />} settingKey="alignAndAttachSoundFile" type="file" />
    </>
  );
}
