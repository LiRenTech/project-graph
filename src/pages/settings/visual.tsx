import { SettingField } from "./_field";

export default function Visual() {
  return (
    <>
      <SettingField
        settingKey="lineStyle"
        title="线段样式"
        type="select"
        options={[
          { label: "直线", value: "stright" },
          { label: "贝塞尔曲线", value: "bezier" },
        ]}
      />
      <SettingField settingKey="showGrid" title="显示网格" type="switch" />
      <SettingField
        settingKey="windowBackgroundAlpha"
        title="背景alpha不透明度"
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField settingKey="showDebug" title="显示调试信息" type="switch" />
      <SettingField
        settingKey="scaleExponent"
        title="视角缩放速度"
        type="slider"
        min={1}
        max={2}
        step={0.1}
      />
      <SettingField
        settingKey="moveAmplitude"
        title="视角移动加速度"
        type="slider"
        min={0}
        max={10}
        step={0.1}
      />
      <SettingField
        settingKey="moveFriction"
        title="视角移动摩擦力系数"
        type="slider"
        min={0}
        max={1}
        step={0.1}
      />
      <SettingField
        settingKey="alwaysShowDetails"
        title="始终显示节点详细信息"
        type="switch"
      />
    </>
  );
}
