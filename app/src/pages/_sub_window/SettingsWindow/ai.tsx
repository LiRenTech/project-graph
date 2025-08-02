import { Dialog } from "@/components/dialog";
import { SettingField } from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Project } from "@/core/Project";
import { AIEngine } from "@/core/service/dataManageService/aiEngine/AIEngine";
import { List } from "lucide-react";

export default function AISettings() {
  return (
    <>
      <SettingField settingKey="aiApiBaseUrl" />
      <SettingField settingKey="aiApiKey" type="password" />
      <SettingField
        settingKey="aiModel"
        extra={
          <Button
            size="icon"
            onClick={async () => {
              await Dialog.show({
                title: "模型列表",
                content: (await new AIEngine(Project.newDraft()).getModels()).join("\n"),
              });
            }}
          >
            <List />
          </Button>
        }
      />
      <SettingField settingKey="aiShowTokenCount" type="switch" />
    </>
  );
}
