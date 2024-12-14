import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import Button from "./Button";

export type KeyModifiers = {
  control: boolean;
  alt: boolean;
  shift: boolean;
};

export default function KeyBind({
  value: key,
  modifiers,
  onChangeKey,
  onChangeModifiers,
}: {
  value: string;
  modifiers: KeyModifiers;
  onChangeKey: (key: string) => void;
  onChangeModifiers: (modifiers: KeyModifiers) => void;
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
      if (
        event.key === "Control" ||
        event.key === "Alt" ||
        event.key === "Shift"
      ) {
        return;
      }
      if (event.key === "Escape") {
        end();
        return;
      }
      onChangeKey(event.key.toLowerCase());
      onChangeModifiers({
        control: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
      });
      end();
    };
    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onChangeKey(`mouse${event.button}`);
      end();
    };
    const handleMouseUp = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.deltaY < 0) {
        onChangeKey("scrollup");
      } else {
        onChangeKey("scrolldown");
      }
      end();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("wheel", handleWheel);

    setChoosing(true);
    onChangeKey("");
    onChangeModifiers({
      control: false,
      alt: false,
      shift: false,
    });
  };

  return (
    <Button
      onClick={startInput}
      className={cn("outline-none outline-0", {
        "bg-blue-950 outline outline-4 outline-blue-500": choosing,
      })}
    >
      {modifiers.control && "Ctrl + "}
      {modifiers.alt && "Alt + "}
      {modifiers.shift && "Shift + "}
      {t(key, { defaultValue: key.toUpperCase() })}
      {key.length === 0 && choosing && "..."}
      {key.length === 0 && !choosing && t("none")}
    </Button>
  );
}
