import { ChevronRight, RotateCw } from "lucide-react";
import React, { startTransition, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Settings } from "../core/service/Settings";
import { Telemetry } from "../core/service/Telemetry";
import { cn } from "../utils/cn";
import Button from "./Button";
import FileChooser from "./FileChooser";
import Input from "./Input";
import Select from "./Select";
import Slider from "./Slider";
import Switch from "./Switch";

export function SettingField({
  settingKey,
  type = "text",
  min = 0,
  max = 100,
  step = 1,
  placeholder = "",
  icon = <></>,
  kind = "file",
  extra = <></>,
}: {
  settingKey: keyof Settings.Settings;
  type?: "text" | "password" | "number" | "slider" | "switch" | "select" | "file";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  icon?: React.ReactNode;
  kind?: "file" | "directory";
  extra?: React.ReactNode;
}) {
  const [value, setValue] = React.useState<any>(Settings.defaultSettings[settingKey]);
  const { t, i18n } = useTranslation("settings");

  React.useEffect(() => {
    Settings.get(settingKey).then((val) => {
      startTransition(() => {
        setValue(val);
      });
    });

    return () => {
      // 如果修改过设置就发送事件
      if (value !== Settings.defaultSettings[settingKey] && settingKey !== "aiApiKey") {
        Telemetry.event("修改设置", {
          key: settingKey,
          value,
        });
      }
    };
  }, [settingKey]);

  React.useEffect(() => {
    if (value !== undefined) {
      Settings.set(settingKey, value);

      if (settingKey === "language") {
        i18n.changeLanguage(value);
      }
    }
  }, [value]);

  return (
    <Field
      title={t(`${settingKey}.title`)}
      description={t(`${settingKey}.description`, { defaultValue: "" })}
      icon={icon}
    >
      <RotateCw
        className="text-panel-details-text h-4 w-4 cursor-pointer opacity-0 hover:rotate-180 group-hover/field:opacity-100"
        onClick={() => setValue(Settings.defaultSettings[settingKey])}
      />
      {extra}
      {type === "text" && <Input value={value} onChange={setValue} placeholder={placeholder} />}
      {type === "password" && <Input value={value} onChange={setValue} placeholder={placeholder} type="password" />}
      {type === "number" && <Input value={value} onChange={setValue} number />}
      {type === "slider" && <Slider value={value} onChange={setValue} min={min} max={max} step={step} />}
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
      {type === "file" && <FileChooser kind={kind} value={value} onChange={setValue} />}
    </Field>
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

const fieldColors = {
  default: "hover:bg-field-group-hover-bg",
  celebrate: "border-2 border-green-500/20 hover:bg-green-500/25",
  danger: "border-2 border-red-500/20 hover:bg-red-500/25",
  warning: "border-2 border-yellow-500/20 hover:bg-yellow-500/25",
  thinking: "border-2 border-blue-500/20 hover:bg-blue-500/25",
  imaging: "border-2 border-purple-500/20 hover:bg-purple-500/25",
};

/**
 * 每一个设置段
 * @param param0
 * @returns
 */
export function Field({
  title = "",
  description = "",
  children = <></>,
  color = "default",
  icon = <></>,
  className = "",
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  color?: "default" | "celebrate" | "danger" | "warning" | "thinking" | "imaging";
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group/field flex w-full items-center justify-between gap-2 rounded-xl p-4",
        fieldColors[color],
        className,
      )}
    >
      <div className="text-settings-text flex items-center gap-2">
        <span>{icon}</span>
        <div className="flex flex-col">
          <span>{title}</span>
          <span className="text-panel-details-text text-xs">
            {description.split("\n").map((dd, ii) => (
              <p key={ii} className="text-xs">
                {dd}
              </p>
            ))}
          </span>
        </div>
      </div>
      <div className="flex-1"></div>
      {children}
    </div>
  );
}

/**
 * 用于给各种设置项提供一个分类组
 * @param param0
 * @returns
 */
export function FieldGroup({
  title = "",
  icon = null,
  children = null,
  className = "",
  description = "",
}: {
  title?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  description?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState<number | string>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setAnimating] = useState(false);
  const [shouldMount, setShouldMount] = useState(isOpen);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (isOpen) setHeight(el.offsetHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setHeight(0);
      return;
    }

    requestAnimationFrame(() => {
      const el = innerRef.current;
      if (el) setHeight(el.offsetHeight);
    });
  }, [isOpen]);

  const handleToggle = () => {
    setAnimating(true);
    const next = !isOpen;
    setIsOpen(next);

    if (next) {
      setShouldMount(true); // 展开：立即挂载
    } else {
      setTimeout(() => {
        // 折叠：动画后再卸载
        setShouldMount(false);
      }, 250);
    }
    setTimeout(() => setAnimating(false), 500);
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div
        className="text-settings-text my-2 flex cursor-pointer items-center gap-2 pl-4 pt-4 text-sm opacity-60 hover:opacity-100"
        onClick={handleToggle}
      >
        <span>{icon}</span>
        <span>{title}</span>
        <ChevronRight className={cn(isOpen && "rotate-90")} />
      </div>

      {description && isOpen && <div className="text-panel-details-text pl-4 text-xs">{description}</div>}

      <div ref={contentRef} className="overflow-hidden rounded-xl transition-all" style={{ height }}>
        {shouldMount && (
          <div
            ref={innerRef}
            className={cn("transition-all", !isOpen && !isAnimating && "pointer-events-none opacity-0")}
          >
            <div className="bg-field-group-bg group/field-group">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
