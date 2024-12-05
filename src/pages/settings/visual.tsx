import {
  AppWindowMac,
  Blend,
  Bug,
  Grid,
  Languages,
  ListCollapse,
  Palette,
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
      <SettingField icon={<Grid />} settingKey="showGrid" type="switch" />
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
