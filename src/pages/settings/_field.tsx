import React from "react";
import Input from "../../components/ui/Input";
import { Settings } from "../../core/Settings";
import Switch from "../../components/ui/Switch";
import Slider from "../../components/ui/Slider";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { getI18n } from "react-i18next";

export function SettingField({
  settingKey,
  title = settingKey,
  showKey = true,
  type = "text",
  options = [],
  min = 0,
  max = 100,
  step = 1,
  placeholder = "",
  icon = <></>,
}: {
  settingKey: keyof Settings.Settings;
  title?: string;
  showKey?: boolean;
  type?: "text" | "number" | "slider" | "switch" | "select";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  const [value, setValue] = React.useState<any>();

  React.useEffect(() => {
    Settings.get(settingKey).then((v) => {
      // console.log("Setting loaded", settingKey, v);
      setValue(v);
    });
  }, []);
  React.useEffect(() => {
    if (value !== undefined) {
      Settings.set(settingKey, value);
      // console.log("Setting saved", settingKey, value);
      if (settingKey === "language") {
        getI18n().changeLanguage(value);
      }
    }
  }, [value]);

  return (
    <div className="flex w-full items-center justify-between rounded-xl p-4 transition hover:bg-white/10">
      <div className="flex items-center gap-2">
        {icon}
        <div className="flex flex-col">
          <span>{title}</span>
          {showKey && (
            <span className="text-xs text-gray-500">{settingKey}</span>
          )}
        </div>
      </div>
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
        <Select value={value} onChange={setValue} options={options}></Select>
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
    <div className="flex w-full items-center justify-between rounded-xl p-4 transition hover:bg-white/10">
      <div className="flex items-center gap-2">
        {icon}
        <div className="flex flex-col">
          <span>{title}</span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
      </div>
      <Button onClick={onClick} disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}
