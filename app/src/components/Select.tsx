import { ChevronDown } from "lucide-react";
import React from "react";
import { cn } from "../utils/cn";
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

    const { left, width, bottom } = ref.current!.getBoundingClientRect();
    setDropdownX(left + width / 2);
    setDropdownY(bottom + 8);
    // 保证多次点击能进行展开和收起的切换
    setShowDropdown(!showDropdown);

    document.addEventListener("pointerdown", handleDocumentClick);
    document.addEventListener("wheel", handleWheel);
  };
  const handleDocumentClick = () => {
    // setShowDropdown(false);
    document.removeEventListener("pointerdown", handleDocumentClick);
    document.removeEventListener("wheel", handleWheel);
  };
  const handleWheel = () => {
    setShowDropdown(false);
  };

  return (
    <>
      <Box
        className={cn(
          "group/select el-select flex appearance-none items-center justify-between gap-1 px-3 py-2 pl-4 hover:cursor-pointer hover:opacity-80",
          className,
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {options.find((option) => option.value === value)?.label}
        <ChevronDown
          className={cn("h-4 w-4 hover:cursor-pointer group-active/select:translate-y-1", {
            "rotate-180": showDropdown,
          })}
        />
      </Box>
      {/* 展开的下拉框 */}
      <div
        className={cn(
          // w-max: 防止下拉框在页面右侧时，宽度不够而缩小
          "el-select-popup fixed z-[104] flex w-max origin-top -translate-x-1/2 scale-0 flex-col rounded-lg border p-2 opacity-0 shadow-lg",
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
            className={cn("el-select-option rounded-lg border px-3 py-2 hover:cursor-pointer", {
              "el-select-option-selected": option.value === value,
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
