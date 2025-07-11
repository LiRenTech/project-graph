import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../utils/cn";
import { formatEmacsKey, parseEmacsKey } from "../utils/emacs";
import { isLinux, isMac, isWindows } from "../utils/platform";
import Button from "./Button";

/**
 * 绑定快捷键的组件
 * @param param0
 * @returns
 */
export default function KeyBind({
  value = "",
  onChange = () => {},
}: {
  value?: string;
  onChange?: (value: string) => void;
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
      onChange(formatEmacsKey(event));
      end();
    };
    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.button !== 0) {
        onChange(formatEmacsKey(event));
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
      onChange(formatEmacsKey(event));
      end();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("wheel", handleWheel);

    setChoosing(true);
    onChange("");
  };

  return (
    <Button
      onClick={startInput}
      className={cn("bg-keybind-bg border-keybind-border text-sm outline-none outline-0 hover:cursor-pointer", {
        "outline-keybind-active-outline bg-blue-950 outline-4": choosing,
      })}
    >
      <Modifiers value={value} />

      {value ? (
        <span className="text-keybind-text">
          {parseEmacsKey(value).key}
          {value.length === 0 && choosing && "..."}
          {value.length === 0 && !choosing && t("none")}
        </span>
      ) : (
        <span className="text-keybind-text">{t("none")}</span>
      )}
    </Button>
  );
}

function Modifiers({ value }: { value: string }) {
  const modifiers = parseEmacsKey(value);

  const mods = [];

  if (modifiers.control) {
    if (isMac) {
      mods.push("⌃control");
    } else if (isWindows) {
      mods.push("Ctrl");
    } else if (isLinux) {
      mods.push("Ctrl");
    } else {
      mods.push("control");
    }
  }
  if (modifiers.alt) {
    if (isMac) {
      mods.push("⌥option");
    } else if (isWindows) {
      mods.push("Alt");
    } else if (isLinux) {
      mods.push("Alt");
    } else {
      mods.push("alt");
    }
  }
  if (modifiers.shift) {
    if (isMac) {
      mods.push("⇧shift");
    } else if (isWindows) {
      mods.push("Shift");
    } else if (isLinux) {
      mods.push("Shift");
    } else {
      mods.push("shift");
    }
  }
  if (modifiers.meta) {
    if (isMac) {
      mods.push("⌘command");
    } else if (isWindows) {
      mods.push("❖Win");
    } else if (isLinux) {
      mods.push("Super");
    } else {
      mods.push("meta");
    }
  }
  return (
    <>
      {mods.map((modifier, index) => (
        <span className="bg-keybind-modifiers-bg text-keybind-modifiers-text rounded px-1" key={index}>
          {modifier}
        </span>
      ))}
    </>
  );
}
