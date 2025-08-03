import { FieldGroup, SettingField } from "@/components/field";
import {
  AppWindow,
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
  MoveHorizontal,
  MoveVertical,
  PictureInPicture,
  Presentation,
  Ratio,
  ReceiptText,
  Rows4,
  Scaling,
  Settings,
  Space,
  Spline,
  Square,
  SquareM,
  Tag,
  VenetianMask,
  Workflow,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Visual() {
  const { t } = useTranslation("visualSettingsGroup");

  return (
    <>
      <FieldGroup title={t("basic.title")} icon={<Settings />}>
        <SettingField icon={<Languages />} settingKey="language" type="select" />
        <SettingField icon={<AppWindow />} settingKey="showTipsOnUI" type="switch" />
        <SettingField icon={<AppWindowMac />} settingKey="useNativeTitleBar" type="switch" />
        <SettingField icon={<Presentation />} settingKey="isClassroomMode" type="switch" />
        <SettingField icon={<Blend />} settingKey="windowBackgroundAlpha" type="slider" min={0} max={1} step={0.01} />
      </FieldGroup>
      <FieldGroup title={t("background.title")} icon={<Grip />}>
        <SettingField icon={<Crosshair />} settingKey="isRenderCenterPointer" type="switch" />
        <SettingField icon={<Rows4 />} settingKey="showBackgroundHorizontalLines" type="switch" />
        <SettingField icon={<Columns4 />} settingKey="showBackgroundVerticalLines" type="switch" />
        <SettingField icon={<Grip />} settingKey="showBackgroundDots" type="switch" />
        <SettingField icon={<Move3d />} settingKey="showBackgroundCartesian" type="switch" />
      </FieldGroup>

      <FieldGroup title={t("node.title")} icon={<Workflow />}>
        <SettingField icon={<Tag />} settingKey="enableTagTextNodesBigDisplay" type="switch" />
        <SettingField icon={<Square />} settingKey="showTextNodeBorder" type="switch" />
      </FieldGroup>
      <FieldGroup title={t("edge.title")} icon={<Spline />}>
        <SettingField icon={<Spline />} settingKey="lineStyle" type="select" />
      </FieldGroup>
      <FieldGroup title={t("section.title")} icon={<Square />}>
        <SettingField icon={<SquareM />} settingKey="sectionBitTitleRenderType" type="select" />
      </FieldGroup>
      <FieldGroup title={t("entityDetails.title")} icon={<ReceiptText />}>
        <SettingField icon={<AppWindow />} settingKey="nodeDetailsPanel" type="select" />
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
      <FieldGroup title={t("help.title")} icon={<MessageCircleQuestion />}>
        <SettingField icon={<Bug />} settingKey="showDebug" type="switch" />
        <SettingField icon={<VenetianMask />} settingKey="protectingPrivacy" type="switch" />
      </FieldGroup>
      <FieldGroup title={t("miniWindow.title")} icon={<PictureInPicture />}>
        <SettingField icon={<MoveHorizontal />} settingKey="windowCollapsingWidth" type="slider" min={50} max={2000} />
        <SettingField icon={<MoveVertical />} settingKey="windowCollapsingHeight" type="slider" min={25} max={2000} />
      </FieldGroup>

      <FieldGroup
        title={t("testingFunctions.title")}
        description={t("testingFunctions.description")}
        icon={<FlaskConical />}
      >
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
