import { RotateCw } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Slider from "../../components/ui/Slider";
import Switch from "../../components/ui/Switch";
import { Settings } from "../../core/Settings";

export function SettingField({
  settingKey,
  type = "text",
  min = 0,
  max = 100,
  step = 1,
  placeholder = "",
  icon = <></>,
}: {
  settingKey: keyof Settings.Settings;
  type?: "text" | "number" | "slider" | "switch" | "select";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  const [value, setValue] = React.useState<any>();
  const { t, i18n } = useTranslation("settings");

  React.useEffect(() => {
    Settings.get(settingKey).then((v) => {
      setValue(v);
    });
  }, []);
  React.useEffect(() => {
    if (value !== undefined) {
      Settings.set(settingKey, value);

      if (settingKey === "language") {
        i18n.changeLanguage(value);
      }
    }
  }, [value]);

  return (
    <div className="flex w-full items-center gap-2 rounded-xl p-4 hover:bg-white/10">
      <div className="flex items-center gap-2">
        {icon}
        <div className="flex flex-col">
          <span>{t(`${settingKey}.title`)}</span>
          <div>
            {t(`${settingKey}.description`, { defaultValue: "" })
              .split("\n")
              .map((dd, ii) => (
                <p key={ii} className="text-xs text-gray-500">
                  {dd}
                </p>
              ))}
          </div>
          <span className="text-xs text-gray-500">{settingKey}</span>
        </div>
      </div>
      <div className="flex-1"></div>
      <button
        onClick={() => {
          setValue(Settings.defaultSettings[settingKey]);
        }}
        className="transition-transform hover:rotate-180 hover:cursor-pointer"
      >
        <RotateCw size={16} className="text-gray-500" />
      </button>
      {type === "text" && (
        <Input value={value} onChange={setValue} placeholder={placeholder} />
      )}
      {type === "number" && <Input value={value} onChange={setValue} number />}
      {type === "slider" && (
        <Slider
          value={value}
          onChange={setValue}
          min={min}
          max={max}
          step={step}
        />
      )}
      {type === "switch" && <Switch value={value} onChange={setValue} />}
      {type === "select" && (
        <Select
          value={value}
          onChange={setValue}
          options={Object.entries(
            t(`${settingKey}.options`, {
              returnObjects: true,
              defaultValue: { error: "Error: options not found" },
            }),
          ).map(([k, v]) => ({
            label: v as string,
            value: k,
          }))}
        ></Select>
      )}
    </div>
  );
}
export function ButtonField({
  title,
  description = "",
  label = "",
  disabled = false,
  onClick = () => {},
  icon = <></>,
}: {
  title: string;
  description?: string;
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Field title={title} description={description} icon={icon}>
      <Button disabled={disabled} onClick={onClick}>
        {label}
      </Button>
    </Field>
  );
}

export function Field({
  title,
  description = "",
  children,
  icon = <></>,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-xl p-4 hover:bg-white/10">
      <div className="flex items-center gap-2">
        {icon}
        <div className="flex flex-col">
          <span>{title}</span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
      </div>
      <div className="flex-1"></div>
      {children}
    </div>
  );
}
