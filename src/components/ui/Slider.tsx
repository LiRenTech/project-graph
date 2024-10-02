import React from "react";

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

  React.useEffect(() => {
    setSliderValue(value);
  }, [value]);

  // 计算 step 的小数位数
  const getDecimalPlaces = (num: number) => {
    return (num.toString().split(".")[1] || []).length;
  };

  const decimalPlaces = getDecimalPlaces(step);

  const calculateValueFromMouse = (x: number, left: number, width: number) => {
    const offsetX = x - left; // 获取鼠标相对滑块左边界的位置
    const percentage = offsetX / width; // 计算百分比

    // 根据百分比计算新值，允许小数点
    const newValue = percentage * (max - min) + min;

    // 根据步长调整值
    const adjustedValue = Math.round((newValue - min) / step) * step + min;

    // 确保值在 min 和 max 之间
    if (adjustedValue >= min && adjustedValue <= max) {
      setSliderValue(parseFloat(adjustedValue.toFixed(decimalPlaces))); // 格式化值
      onChange(parseFloat(adjustedValue.toFixed(decimalPlaces))); // 格式化值
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      calculateValueFromMouse(
        event.clientX,
        event.currentTarget.getBoundingClientRect().left,
        event.currentTarget.getBoundingClientRect().width,
      );
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
      calculateValueFromMouse(
        event.touches[0].clientX,
        event.currentTarget.getBoundingClientRect().left,
        event.currentTarget.getBoundingClientRect().width,
      );
    }
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative h-4 w-36"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-neutral-700"></div>
        <div
          className="absolute top-0 h-4 w-4 -translate-x-2 rounded-full bg-blue-400 transition-all duration-75"
          style={{ left: `${((sliderValue - min) / (max - min)) * 100}%` }} // 根据当前值计算滑块的位置
        ></div>
      </div>
      <span>{sliderValue?.toFixed(decimalPlaces)}</span>{" "}
      {/* 格式化显示的小数位数 */}
    </div>
  );
}