import { SoundService } from "../core/service/feedbackService/SoundService";
import { cn } from "../utils/cn";

/**
 * 手机上那种 滑动圆球的 小开关按钮
 * @param param0
 * @returns
 */
export default function Switch({
  value = false,
  onChange = () => {},
  disabled = false,
}: {
  value?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn("group/switch bg-switch-false-bg relative h-8 w-14 rounded-full hover:cursor-pointer", {
        "bg-switch-true-bg": value,
        "bg-switch-disabled-bg cursor-not-allowed": disabled,
      })}
      onClick={() => {
        const newValue = !value;
        onChange(newValue);
        if (newValue) {
          SoundService.play.mouseClickSwitchButtonOn();
        } else {
          SoundService.play.mouseClickSwitchButtonOff();
        }
      }}
    >
      <div
        className={cn(
          "bg-switch-false-dot absolute left-1 top-1 h-6 w-6 translate-x-0 transform rounded-full hover:cursor-pointer group-hover/switch:scale-125 group-active/switch:scale-75",
          {
            "bg-switch-true-dot translate-x-6": value,
            "bg-switch-disabled-dot": disabled,
          },
        )}
      ></div>
    </div>
  );
}
