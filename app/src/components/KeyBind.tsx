import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyBinds } from "../core/service/controlService/KeyBinds";
import { cn } from "../utils/cn";
import Button from "./Button";

/**
 * 绑定快捷键的组件
 * @param param0
 * @returns
 */
export default function KeyBind({
  value = { key: "", modifiers: { control: false, alt: false, shift: false, meta: false } },
  onChange = () => {},
}: {
  value?: { key: string; modifiers: KeyBinds.KeyModifiers };
  onChange?: (value: { key: string; modifiers: KeyBinds.KeyModifiers }) => void;
}) {
  const [choosing, setChoosing] = useState(false);
  const { t } = useTranslation("keys");

  const startInput = () => {
    const end = () => {
      setChoosing(false);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("wheel", handleWheel);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      if (event.key === "Control" || event.key === "Alt" || event.key === "Shift" || event.key === "Meta") {
        return;
      }
      if (event.key === "Escape") {
        end();
        return;
      }
      const modifiers = {
        control: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      };
      onChange({ key: event.key, modifiers });
      end();
    };
    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const modifiers = {
        control: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      };
      if (event.button !== 0) {
        onChange({
          key: `mouse${event.button}`,
          modifiers,
        });
        end();
      }
    };
    const handleMouseUp = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const modifiers = {
        control: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      };
      if (event.deltaY < 0) {
        onChange({ key: "wheelup", modifiers });
      } else {
        onChange({ key: "wheeldown", modifiers });
      }
      end();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("wheel", handleWheel);

    setChoosing(true);
    onChange({
      key: "",
      modifiers: { control: false, alt: false, shift: false, meta: false },
    });
  };

  return (
    <Button
      onClick={startInput}
      className={cn(
        "bg-keybind-bg text-keybind-text border-keybind-border outline-none outline-0 hover:cursor-pointer",
        {
          "outline-keybind-active-outline bg-blue-950 outline-4": choosing,
        },
      )}
    >
      {value.modifiers.control && "Ctrl + "}
      {value.modifiers.alt && "Alt + "}
      {value.modifiers.shift && "Shift + "}
      {value.key ? (
        <>
          {t(value.key, { defaultValue: value.key.toUpperCase() })}
          {value.key.length === 0 && choosing && "..."}
          {value.key.length === 0 && !choosing && t("none")}
        </>
      ) : (
        <>{t("none")}</>
      )}
    </Button>
  );
}
