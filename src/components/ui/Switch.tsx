import { cn } from "../../utils/cn";

/**
 * 手机上那种 滑动圆球的 小开关按钮
 * @param param0
 * @returns
 */
export default function Switch({
  value = false,
  onChange = () => {},
}: {
  value?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div
      className={cn("relative h-8 w-14 rounded-full bg-neutral-800", {
        "bg-blue-500": value,
      })}
      onClick={() => onChange(!value)}
    >
      <div
        className={cn(
          "absolute left-1 top-1 h-6 w-6 translate-x-0 transform rounded-full bg-white",
          {
            "translate-x-6": value,
          },
        )}
      ></div>
    </div>
  );
}
