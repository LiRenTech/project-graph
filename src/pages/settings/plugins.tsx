import { open as openFile } from "@tauri-apps/plugin-dialog";
import { open } from "@tauri-apps/plugin-shell";
import { BookOpen, Box, PartyPopper, Plug, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../components/ui/Button";
import Switch from "../../components/ui/Switch";
import { Dialog } from "../../utils/dialog";
import { Field } from "./_field";

export default function PluginsPage() {
  const { t } = useTranslation("plugins");

  const install = async () => {
    const path = await openFile({
      filters: [
        {
          name: "Plugin",
          extensions: ["pg-plugin"],
        },
      ],
    });
    if (!path) return;
    await Dialog.show({
      title: t("install.warning.title"),
      content: t("install.warning.content", {
        name: "plugin name",
        author: "author author",
        permission: ["perm1", "perm2", "perm3"],
      }),
      type: "warning",
      buttons: [
        {
          text: t("install.button.cancel"),
        },
        {
          text: t("install.button.install"),
        },
      ],
    });
  };

  return (
    <>
      <Field
        icon={<PartyPopper />}
        title={t("welcome.title")}
        color="green"
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
      <Field
        icon={<Plug />}
        title="Core"
        description={
          "Provides the core functionality of the app\nAuthor: Project Graph Developers"
        }
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
