import {
  Blend,
  Bug,
  Grid,
  ListCollapse,
  Move,
  ScanEye,
  Spline,
} from "lucide-react";
import { SettingField } from "./_field";

export default function Visual() {
  return (
    <>
      <SettingField
        icon={<Spline />}
        settingKey="lineStyle"
        title="线段样式"
        type="select"
        options={[
          { label: "直线", value: "stright" },
          { label: "贝塞尔曲线", value: "bezier" },
          { label: "垂直折线", value: "vertical" },
        ]}
      />
      <SettingField
        icon={<Grid />}
        settingKey="showGrid"
        title="显示网格"
        type="switch"
      />
      <SettingField
        icon={<Blend />}
        settingKey="windowBackgroundAlpha"
        title="背景alpha不透明度"
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField
        icon={<Bug />}
        settingKey="showDebug"
        title="显示调试信息"
        type="switch"
      />
      <SettingField
        icon={<ScanEye />}
        settingKey="scaleExponent"
        title="视角缩放速度"
        type="slider"
        min={1}
        max={2}
        step={0.1}
      />
      <SettingField
        icon={<Move />}
        settingKey="moveAmplitude"
        title="视角移动加速度"
        type="slider"
        min={0}
        max={10}
        step={0.1}
      />
      <SettingField
        icon={<Move />}
        settingKey="moveFriction"
        title="视角移动摩擦力系数"
        type="slider"
        min={0}
        max={1}
        step={0.1}
      />
      <SettingField
        icon={<ListCollapse />}
        settingKey="alwaysShowDetails"
        title="始终显示节点详细信息"
        type="switch"
      />
    </>
  );
}
