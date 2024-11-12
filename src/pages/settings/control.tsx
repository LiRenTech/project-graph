import { Move, ScanEye, Skull } from "lucide-react";
import { SettingField } from "./_field";
import { useTranslation } from "react-i18next";

export default function Control() {
  const { t } = useTranslation("settingsControl");

  return (
    <>
      <SettingField
        icon={<ScanEye />}
        settingKey="scaleExponent"
        title={t("scaleExponent")}
        details={
          "《当前缩放倍数》会不断的以一定倍率无限逼近《目标缩放倍数》\n当逼近的足够近时（小于0.0001），会自动停止缩放\n值为1代表缩放会立刻完成，没有中间的过渡效果\n值为0代表缩放永远都不会完成，可模拟锁死效果"
        }
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Move />}
        settingKey="moveAmplitude"
        title={t("moveAmplitude")}
        details={
          "此设置项用于 使用W S A D按键来上下左右移动视角时的情景\n可将摄像机看成一个能朝四个方向喷气的 悬浮飞机\n此加速度值代表着喷气的动力大小，需要结合下面的摩擦力设置来调整速度"
        }
        type="slider"
        min={0}
        max={10}
        step={0.1}
      />
      <SettingField
        icon={<Move />}
        settingKey="moveFriction"
        title={t("moveFriction")}
        details={
          "此设置项用于 使用W S A D按键来上下左右移动视角时的情景\n摩擦系数越大，滑动的距离越小，摩擦系数越小，滑动的距离越远\n此值=0时代表 绝对光滑"
        }
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Skull />}
        settingKey="gamepadDeadzone"
        title={t("gamepadDeadzone")}
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
    </>
  );
}
