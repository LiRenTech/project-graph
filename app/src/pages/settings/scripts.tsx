import { open as openFile } from "@tauri-apps/plugin-dialog";
import { open } from "@tauri-apps/plugin-shell";
import { BookOpen, CodeXml, Delete, FileCode2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import { Field } from "./_field";
import { useEffect, useState } from "react";
import { UserScriptsManager } from "../../core/plugin/UserScriptsManager";
import Switch from "../../components/Switch";
import IconButton from "../../components/IconButton";
// import { Dialog } from "../../components/dialog";

export default function ScriptsPage() {
  const { t } = useTranslation("plugins");

  const [userScripts, setUserScripts] = useState<UserScriptsManager.UserScriptFile[]>([]);

  useEffect(() => {
    updateUIList();
  }, []);

  const updateUIList = async () => {
    await UserScriptsManager.validAndRefresh();
    const scripts = await UserScriptsManager.getAllUserScripts();
    setUserScripts(scripts);
  };

  /**
   * 从本地安装脚本
   * @returns
   */
  const install = async () => {
    const path = await openFile({
      filters: [
        {
          name: "JavaScript",
          extensions: ["js"],
        },
      ],
    });
    if (!path) return;

    await UserScriptsManager.addUserScript(path);
    updateUIList();
  };

  return (
    <>
      <Field icon={<CodeXml />} title="脚本管理">
        <Button onClick={install}>
          <FileCode2 />
          安装脚本
        </Button>
        <Button onClick={() => open("https://project-graph.top")}>
          <BookOpen />
          {t("documentation")}
        </Button>
      </Field>

      <div className="flex flex-col p-2">
        {userScripts.map((script) => {
          return (
            <div key={script.path} className="bg-panel-bg text-panel-text relative m-2 flex flex-row rounded-md p-2">
              <div className="flex flex-1 flex-col">
                <h3>
                  {script.scriptData.name}
                  <span className="bg-settings-page-bg text-panel-text ml-2 rounded-md px-1 text-sm">
                    {script.scriptData.version}
                  </span>
                </h3>
                <p className="text-panel-details-text text-sm">{script.scriptData.description}</p>
                <p className="text-panel-details-text text-xs">{script.path}</p>
                <p className="text-panel-details-text text-xs">{script.scriptData.author}</p>
              </div>
              <div className="flex flex-row items-center justify-center gap-2">
                <Switch
                  value={script.enabled}
                  onChange={async (value) => {
                    // console.log(value);
                    await UserScriptsManager.setUserScriptEnabled(script.path, value);
                    updateUIList();
                  }}
                />
                <IconButton
                  onClick={async () => {
                    await UserScriptsManager.removeUserScript(script.path);
                    updateUIList();
                  }}
                  tooltip={"仅从列表删除，不会影响脚本文件"}
                >
                  <Delete />
                </IconButton>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
