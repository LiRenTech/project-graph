import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyBinds } from "../core/service/controlService/KeyBinds";
import { cn } from "../utils/cn";
import Button from "./Button";
import { isLinux, isMac, isWindows } from "../utils/platform";

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

  const getModifiersName = () => {
    // 如果什么控制键都没有，就什么也不加
    if (!value.modifiers.control && !value.modifiers.alt && !value.modifiers.shift && !value.modifiers.meta) {
      return <></>;
    }

    const modifiers = [];

    if (value.modifiers.control) {
      if (isMac) {
        modifiers.push("⌃control");
      } else if (isWindows) {
        modifiers.push("Ctrl");
      } else if (isLinux) {
        modifiers.push("Ctrl");
      } else {
        modifiers.push("control");
      }
    }
    if (value.modifiers.alt) {
      if (isMac) {
        modifiers.push("⌥option");
      } else if (isWindows) {
        modifiers.push("Alt");
      } else if (isLinux) {
        modifiers.push("Alt");
      } else {
        modifiers.push("alt");
      }
    }
    if (value.modifiers.shift) {
      if (isMac) {
        modifiers.push("⇧shift");
      } else if (isWindows) {
        modifiers.push("Shift");
      } else if (isLinux) {
        modifiers.push("Shift");
      } else {
        modifiers.push("shift");
      }
    }
    if (value.modifiers.meta) {
      if (isMac) {
        modifiers.push("⌘command");
      } else if (isWindows) {
        modifiers.push("❖Win");
      } else if (isLinux) {
        modifiers.push("Meta");
      } else {
        modifiers.push("meta");
      }
    }
    return (
      <>
        {modifiers.map((modifier, index) => (
          <span className="bg-keybind-modifiers-bg text-keybind-modifiers-text rounded px-1" key={index}>
            {modifier}
          </span>
        ))}
      </>
    );
  };

  return (
    <Button
      onClick={startInput}
      className={cn("bg-keybind-bg border-keybind-border text-sm outline-none outline-0 hover:cursor-pointer", {
        "outline-keybind-active-outline bg-blue-950 outline-4": choosing,
      })}
    >
      {getModifiersName()}

      {value.key ? (
        <span className="text-keybind-text">
          {t(value.key, { defaultValue: value.key.toUpperCase() })}
          {value.key.length === 0 && choosing && "..."}
          {value.key.length === 0 && !choosing && t("none")}
        </span>
      ) : (
        <span className="text-keybind-text">{t("none")}</span>
      )}
    </Button>
  );
}
