import React from "react";
import Input from "./Input";

/**
 * 一个滑块组件，可以设置最小值、最大值、步长、当前值、值变化回调函数。
 *
 * -------o---
 *
 * @param param0
 * @returns
 */
export default function Slider({
  value = 0,
  onChange = () => {},
  min = 0,
  max = 100,
  step = 1,
}: {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [sliderValue, setSliderValue] = React.useState(value);
  const [isDragging, setIsDragging] = React.useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSliderValue(value);
  }, [value]);

  // 计算 step 的小数位数
  const getDecimalPlaces = (num: number) => {
    return (num.toString().split(".")[1] || []).length;
  };

  const decimalPlaces = getDecimalPlaces(step);

  const calculateValueFromMouse = (x: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = x - rect.left; // 获取鼠标相对滑块左边界的位置
    const percentage = offsetX / rect.width; // 计算百分比

    // 根据百分比计算新值，允许小数点
    let newValue = percentage * (max - min) + min;

    // 如果鼠标在最左侧，直接设置为 min
    if (offsetX <= 0) {
      newValue = min;
    }
    // 如果鼠标在最右侧，直接设置为 max
    else if (offsetX >= rect.width) {
      newValue = max;
    } else {
      // 根据步长调整值
      newValue = Math.round((newValue - min) / step) * step + min;
    }

    // 确保值在 min 和 max 之间
    if (newValue >= min && newValue <= max) {
      setSliderValue(parseFloat(newValue.toFixed(decimalPlaces))); // 格式化值
      onChange(parseFloat(newValue.toFixed(decimalPlaces))); // 格式化值
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      calculateValueFromMouse(event.clientX);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 1) {
      calculateValueFromMouse(event.touches[0].clientX);
    }
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 处理轨道点击事件
  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    calculateValueFromMouse(event.clientX);
  };

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex items-center gap-4">
      {/* 滑动区域 */}
      <div
        ref={sliderRef}
        className="relative h-4 w-36 hover:cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleTrackClick} // 添加轨道点击事件
      >
        {/* 滑动轨道 */}
        <div className="bg-slider-line absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full hover:cursor-pointer" />
        {/* 滑动球 */}
        <div
          className="bg-slider-handle absolute top-0 h-4 w-4 -translate-x-2 rounded-full hover:scale-125 hover:cursor-w-resize active:scale-90"
          style={{ left: `${((sliderValue - min) / (max - min)) * 100}%` }} // 根据当前值计算滑块的位置
        />
      </div>
      <Input
        value={sliderValue.toString()}
        onChange={(e) => {
          if (e.endsWith(".")) {
            // @ts-expect-error 防止无法输入小数点
            setSliderValue(e);
          } else {
            // 确保值在 min 和 max 之间
            const userInput = Math.max(min, Math.min(max, parseFloat(e || "0")));
            setSliderValue(userInput);
            onChange(userInput);
          }
        }}
        className="w-16"
      />
      {/* 格式化显示的小数位数 */}
    </div>
  );
}
