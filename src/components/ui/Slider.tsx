import React from "react";
import Input from "./Input";

interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider: React.ForwardRefRenderFunction<HTMLInputElement, SliderProps> = (
  { value = 0, onChange = () => {}, min = 0, max = 100, step = 1 },
  ref,
) => {
  const [sliderValue, setSliderValue] = React.useState(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setSliderValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        ref={ref}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        className="h-1 w-48 cursor-pointer appearance-none rounded-lg bg-gray-700 accent-blue-600"
      />
      <Input
        value={sliderValue.toString()}
        onChange={(e) => {
          if (e.endsWith(".")) {
            // @ts-expect-error 防止无法输入小数点
            setSliderValue(e);
          } else {
            setSliderValue(
              // 确保值在 min 和 max 之间
              Math.max(min, Math.min(max, parseFloat(e || "0"))),
            );
          }
        }}
        className="w-16"
      />
      {/* 格式化显示的小数位数 */}
    </div>
  );
};

export default React.forwardRef(Slider);
