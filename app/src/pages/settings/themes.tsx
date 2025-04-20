import { useTranslation } from "react-i18next";
import { Field } from "../../components/Field";
import Switch from "../../components/Switch";
import { Settings } from "../../core/service/Settings";
import { Themes } from "../../core/service/Themes";

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
            value={currentTheme === theme.metadata.id}
            onChange={() => setCurrentTheme(theme.metadata.id as any)}
          />
        </Field>
      ))}
    </>
  );
}
