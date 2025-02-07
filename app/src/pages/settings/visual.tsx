import {
  AppWindowMac,
  ArrowDownNarrowWide,
  Blend,
  Bug,
  CaseSensitive,
  Columns4,
  Crosshair,
  FlaskConical,
  Grip,
  Languages,
  ListCollapse,
  MessageCircleQuestion,
  Move3d,
  Palette,
  Ratio,
  Rows4,
  Scaling,
  Settings,
  Space,
  Spline,
  Tag,
  VenetianMask,
  Workflow,
} from "lucide-react";
import { FieldGroup, SettingField } from "./_field";
export default function Visual() {
  return (
    <>
      <FieldGroup title="Basic Settings 基础设置" icon={<Settings />}>
        <SettingField icon={<Languages />} settingKey="language" type="select" />
        <SettingField icon={<Palette />} settingKey="theme" type="select" />
        <SettingField icon={<Palette />} settingKey="uiTheme" type="select" />
        <SettingField icon={<AppWindowMac />} settingKey="useNativeTitleBar" type="switch" />
        <SettingField icon={<Blend />} settingKey="windowBackgroundAlpha" type="slider" min={0} max={1} step={0.01} />
      </FieldGroup>
      <FieldGroup title="Background 背景设置" icon={<Grip />}>
        <SettingField icon={<Crosshair />} settingKey="isRenderCenterPointer" type="switch" />
        <SettingField icon={<Rows4 />} settingKey="showBackgroundHorizontalLines" type="switch" />
        <SettingField icon={<Columns4 />} settingKey="showBackgroundVerticalLines" type="switch" />
        <SettingField icon={<Grip />} settingKey="showBackgroundDots" type="switch" />
        <SettingField icon={<Move3d />} settingKey="showBackgroundCartesian" type="switch" />
      </FieldGroup>

      <FieldGroup title="Node & Edge 节点与连线样式" icon={<Workflow />}>
        <SettingField icon={<Spline />} settingKey="lineStyle" type="select" />
        <SettingField icon={<Tag />} settingKey="enableTagTextNodesBigDisplay" type="switch" />
        <SettingField icon={<ListCollapse />} settingKey="alwaysShowDetails" type="switch" />
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
      </FieldGroup>
      <FieldGroup title="Help 遇到问题时相关的设置" icon={<MessageCircleQuestion />}>
        <SettingField icon={<Bug />} settingKey="showDebug" type="switch" />
        <SettingField icon={<VenetianMask />} settingKey="protectingPrivacy" type="switch" />
      </FieldGroup>
      <FieldGroup title="Testing Functions 实验性功能" icon={<FlaskConical />}>
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
      </FieldGroup>
    </>
  );
}
