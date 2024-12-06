import { open } from "@tauri-apps/plugin-shell";
import { BookOpen, Box, Plug, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../components/ui/Button";
import { Field } from "./_field";

export default function PluginsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Field icon={<Plug />} title={t("plugins.title")}>
        <Button>
          <Box />
          {t("plugins.install")}
        </Button>
        <Button onClick={() => open("https://liren.zty012.de/project-graph")}>
          <BookOpen />
          {t("plugins.documentation")}
        </Button>
      </Field>
      <Field
        icon={<Plug />}
        title="plugin name"
        description="plugin description"
      >
        <Button>
          <X />
          {t("plugins.uninstall")}
        </Button>
      </Field>
    </>
  );
}
