import { open } from "@tauri-apps/plugin-shell";
import { Cloud, File } from "lucide-react";
import Button from "../../components/Button";
import { SettingField } from "../../components/Field";

export default function Welcome() {
  return (
    <>
      <SettingField settingKey="agreeTerms" icon={<File />} type="switch" />
      <SettingField settingKey="allowTelemetry" icon={<Cloud />} type="switch" />
      <div className="mt-4">
        <Button onClick={() => open("https://project-graph.top/docs/app/terms")}>查看用户协议</Button>
      </div>
    </>
  );
}
