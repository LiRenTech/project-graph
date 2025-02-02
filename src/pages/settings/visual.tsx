import {
  AppWindowMac,
  ArrowDownNarrowWide,
  Blend,
  Bug,
  CaseSensitive,
  Columns4,
  Crosshair,
  Grip,
  Languages,
  ListCollapse,
  Move3d,
  Palette,
  Ratio,
  Rows4,
  Scaling,
  Space,
  Spline,
  VenetianMask,
} from "lucide-react";
import { SettingField } from "./_field";
export default function Visual() {
  return (
    <>
      <SettingField icon={<Languages />} settingKey="language" type="select" />
      <SettingField icon={<Palette />} settingKey="theme" type="select" />
      <SettingField icon={<Palette />} settingKey="uiTheme" type="select" />
      <SettingField icon={<Spline />} settingKey="lineStyle" type="select" />
      {/* <SettingField icon={<Grid />} settingKey="showGrid" type="switch" /> */}
      <SettingField icon={<Crosshair />} settingKey="isRenderCenterPointer" type="switch" />
      <SettingField icon={<Rows4 />} settingKey="showBackgroundHorizontalLines" type="switch" />
      <SettingField icon={<Columns4 />} settingKey="showBackgroundVerticalLines" type="switch" />
      <SettingField icon={<Grip />} settingKey="showBackgroundDots" type="switch" />
      <SettingField icon={<Move3d />} settingKey="showBackgroundCartesian" type="switch" />
      <SettingField icon={<Blend />} settingKey="windowBackgroundAlpha" type="slider" min={0} max={1} step={0.01} />
      <SettingField icon={<Bug />} settingKey="showDebug" type="switch" />
      <SettingField icon={<VenetianMask />} settingKey="protectingPrivacy" type="switch" />

      <SettingField icon={<ListCollapse />} settingKey="alwaysShowDetails" type="switch" />
      <SettingField icon={<AppWindowMac />} settingKey="useNativeTitleBar" type="switch" />
      <SettingField
        icon={<CaseSensitive />}
        settingKey="entityDetailsFontSize"
        type="slider"
        min={18}
        max={36}
        step={1}
      />
      <SettingField
        icon={<ArrowDownNarrowWide />}
        settingKey="entityDetailsLinesLimit"
        type="slider"
        min={1}
        max={200}
        step={2}
      />
      <SettingField
        icon={<Space />}
        settingKey="entityDetailsWidthLimit"
        type="slider"
        min={200}
        max={2000}
        step={100}
      />

      <SettingField icon={<Ratio />} settingKey="limitCameraInCycleSpace" type="switch" />
      <SettingField
        icon={<Scaling />}
        settingKey="cameraCycleSpaceSizeX"
        type="slider"
        min={1000}
        max={10000}
        step={1000}
      />
      <SettingField
        icon={<Scaling />}
        settingKey="cameraCycleSpaceSizeY"
        type="slider"
        min={1000}
        max={10000}
        step={1000}
      />
    </>
  );
}
