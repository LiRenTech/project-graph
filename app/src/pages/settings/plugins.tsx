import { open as openFile } from "@tauri-apps/plugin-dialog";
import { open } from "@tauri-apps/plugin-shell";
import { BookOpen, Box, PartyPopper, Plug, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import Switch from "../../components/Switch";
import { Field } from "./_field";
import { readTextFile } from "../../utils/fs";
// import { parsePluginCode } from "../../core/plugin/PluginCodeParseData";
// import { Dialog } from "../../components/dialog";

export default function PluginsPage() {
  const { t } = useTranslation("plugins");

  /**
   * 从本地安装插件
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

    // 开始解析插件内容代码格式

    const code = await readTextFile(path);
    // 解析插件内容，判断是否符合插件格式要求
    console.log(code);
    // const { pluginData, error, success } = parsePluginCode(code);

    // if (!success) {
    //   console.error(error);
    //   Dialog.show({
    //     title: "Error",
    //     content: error,
    //     type: "error",
    //   });
    //   return;
    // }

    // const { name, author, permission } = pluginData;

    // await Dialog.show({
    //   title: t("install.warning.title"),
    //   content: t("install.warning.content", {
    //     name: "plugin name",
    //     author: "author author",
    //     permission: ["perm1", "perm2", "perm3"],
    //   }),
    //   type: "warning",
    //   buttons: [
    //     {
    //       text: t("install.button.cancel"),
    //     },
    //     {
    //       text: t("install.button.install"),
    //     },
    //   ],
    // });
  };

  return (
    <>
      <Field
        icon={<PartyPopper />}
        title={t("welcome.title")}
        color="celebrate"
        description={t("welcome.description")}
      ></Field>
      <Field icon={<Plug />} title={t("title")}>
        <Button onClick={install}>
          <Box />
          {t("install")}
        </Button>
        <Button onClick={() => open("https://project-graph.top")}>
          <BookOpen />
          {t("documentation")}
        </Button>
      </Field>

      {/* 核心插件，不能卸载 */}
      <Field
        icon={<Plug />}
        title="Core"
        description={"Provides the core functionality of the app\nAuthor: Project Graph Developers"}
      >
        <Button disabled>
          <X />
          {t("uninstall")}
        </Button>
        <Switch value={true} onChange={() => {}} disabled />
      </Field>
    </>
  );
}
