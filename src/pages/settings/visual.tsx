import {
  AppWindowMac,
  Blend,
  Bug,
  Columns4,
  Crosshair,
  Grip,
  Languages,
  ListCollapse,
  Move3d,
  Palette,
  Rows4,
  Spline,
  VenetianMask,
} from "lucide-react";
import { SettingField } from "./_field";
export default function Visual() {
  return (
    <>
      <SettingField icon={<Languages />} settingKey="language" type="select" />
      <SettingField icon={<Palette />} settingKey="theme" type="select" />
      <SettingField icon={<Spline />} settingKey="lineStyle" type="select" />
      {/* <SettingField icon={<Grid />} settingKey="showGrid" type="switch" /> */}
      <SettingField
        icon={<Crosshair />}
        settingKey="isRenderCenterPointer"
        type="switch"
      />
      <SettingField
        icon={<Rows4 />}
        settingKey="showBackgroundHorizontalLines"
        type="switch"
      />
      <SettingField
        icon={<Columns4 />}
        settingKey="showBackgroundVerticalLines"
        type="switch"
      />
      <SettingField
        icon={<Grip />}
        settingKey="showBackgroundDots"
        type="switch"
      />
      <SettingField
        icon={<Move3d />}
        settingKey="showBackgroundCartesian"
        type="switch"
      />
      <SettingField
        icon={<Blend />}
        settingKey="windowBackgroundAlpha"
        type="slider"
        min={0}
        max={1}
        step={0.01}
      />
      <SettingField icon={<Bug />} settingKey="showDebug" type="switch" />
      <SettingField
        icon={<VenetianMask />}
        settingKey="protectingPrivacy"
        type="switch"
      />

      <SettingField
        icon={<ListCollapse />}
        settingKey="alwaysShowDetails"
        type="switch"
      />
      <SettingField
        icon={<AppWindowMac />}
        settingKey="useNativeTitleBar"
        type="switch"
      />
    </>
  );
}
