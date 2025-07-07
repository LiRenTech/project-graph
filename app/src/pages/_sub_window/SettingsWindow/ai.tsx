import { List } from "lucide-react";
import { Dialog } from "../../../components/dialog";
import { SettingField } from "../../../components/Field";
import IconButton from "../../../components/IconButton";
import { Project } from "../../../core/Project";
import { AIEngine } from "../../../core/service/dataManageService/aiEngine/AIEngine";

export default function AISettings() {
  return (
    <>
      <SettingField settingKey="aiApiBaseUrl" />
      <SettingField settingKey="aiApiKey" type="password" />
      <SettingField
        settingKey="aiModel"
        extra={
          <IconButton
            onClick={async () => {
              await Dialog.show({
                title: "模型列表",
                content: (await new AIEngine(Project.newDraft()).getModels()).join("\n"),
              });
            }}
          >
            <List />
          </IconButton>
        }
      />
    </>
  );
}
