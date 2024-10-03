import React from "react";
import Input from "../../components/ui/Input";
import { Settings } from "../../core/Settings";
import Switch from "../../components/ui/Switch";
import Slider from "../../components/ui/Slider";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

export function SettingField({
  settingKey,
  title = settingKey,
  type = "text",
  options = [],
  min = 0,
  max = 100,
  step = 1,
}: {
  settingKey: keyof Settings.Settings;
  title?: string;
  type?: "text" | "number" | "slider" | "switch" | "select";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
}) {
  const [value, setValue] = React.useState<any>();

  React.useEffect(() => {
    Settings.get(settingKey).then((v) => {
      setValue(v);
    });
  }, []);
  React.useEffect(() => {
    Settings.set(settingKey, value);
  }, [value]);

  return (
    <div className="flex w-full items-center justify-between rounded-xl p-4 transition hover:bg-white/10">
      <div className="flex flex-col">
        <span>{title}</span>
        <span className="text-xs text-gray-500">{settingKey}</span>
      </div>
      {type === "text" && (
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      )}
      {type === "number" && (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          number
        />
      )}
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
}: {
  title: string;
  description?: string;
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between rounded-xl p-4 transition hover:bg-white/10">
      <div className="flex flex-col">
        <span>{title}</span>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <Button onClick={onClick} disabled={disabled}>
        {label}
      </Button>
    </div>
  );
}
