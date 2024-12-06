import { open } from "@tauri-apps/plugin-shell";
import { BookOpen, Box, PartyPopper, Plug, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../components/ui/Button";
import Switch from "../../components/ui/Switch";
import { Field } from "./_field";

export default function PluginsPage() {
  const { t } = useTranslation("plugins");

  return (
    <>
      <Field
        icon={<PartyPopper />}
        title={t("welcome.title")}
        color="green"
        description={t("welcome.description")}
      ></Field>
      <Field icon={<Plug />} title={t("title")}>
        <Button>
          <Box />
          {t("install")}
        </Button>
        <Button onClick={() => open("https://liren.zty012.de/project-graph")}>
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
        <Button>
          <X />
          {t("uninstall")}
        </Button>
        <Switch value={true} onChange={() => {}} />
      </Field>
    </>
  );
}
