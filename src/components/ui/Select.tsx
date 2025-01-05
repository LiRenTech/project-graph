import React from "react";
import { cn } from "../../utils/cn";
import Box from "./Box";

export default function Select({
  className = "",
  value = "",
  onChange = () => {},
  options = [],
  ...props
}: {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: { label: string; value: string }[];
  [key: string]: any;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dropdownX, setDropdownX] = React.useState(0);
  const [dropdownY, setDropdownY] = React.useState(0);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const { left, bottom } = ref.current!.getBoundingClientRect();
    setDropdownX(left - 8);
    setDropdownY(bottom);
    setShowDropdown(true);

    document.addEventListener("pointerdown", handleDocumentClick);
    document.addEventListener("wheel", handleDocumentClick);
  };
  const handleDocumentClick = () => {
    setShowDropdown(false);
    document.removeEventListener("pointerdown", handleDocumentClick);
    document.removeEventListener("wheel", handleDocumentClick);
  };

  return (
    <>
      <Box
        className={cn("appearance-none px-3 py-2 hover:opacity-80", className)}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {options.find((option) => option.value === value)?.label}
      </Box>
      {/* 展开的下拉框 */}
      <div
        className={cn(
          "fixed z-[104] flex origin-top scale-0 flex-col rounded-2xl bg-neutral-900 p-2 opacity-0",
          {
            "scale-100 opacity-100": showDropdown,
          },
        )}
        style={{
          left: dropdownX,
          top: dropdownY,
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {options.map((option) => (
          <button
            key={option.value}
            className={cn("rounded-xl px-3 py-2 hover:bg-neutral-700", {
              "bg-neutral-700": option.value === value,
              "active:scale-90": option.value !== value,
            })}
            onClick={() => {
              onChange(option.value);
              setShowDropdown(false);
              document.removeEventListener("pointerdown", handleDocumentClick);
              document.removeEventListener("wheel", handleDocumentClick);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}
