import { Field } from "@/components/Field";
import { Switch } from "@/components/ui/switch";
import { Settings } from "@/core/service/Settings";
import { Themes } from "@/core/service/Themes";
import { useTranslation } from "react-i18next";

export default function ThemesPage() {
  const { i18n } = useTranslation();
  const [currentTheme, setCurrentTheme] = Settings.use("theme");

  return (
    <>
      {Themes.builtinThemes.map((theme) => (
        <Field
          key={theme.metadata.id}
          title={theme.metadata.name[i18n.resolvedLanguage!]}
          description={theme.metadata.description.zh_CN + "\n" + theme.metadata.author}
        >
          <Switch
            checked={currentTheme === theme.metadata.id}
            onCheckedChange={() => setCurrentTheme(theme.metadata.id as any)}
          />
        </Field>
      ))}
    </>
  );
}
