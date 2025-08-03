import { FieldGroup, SettingField } from "@/components/field";
import { isMac } from "@/utils/platform";
import {
  AlignStartVertical,
  Crosshair,
  Fullscreen,
  Gamepad2,
  GitCompareArrows,
  Grab,
  Hand,
  HandMetal,
  Keyboard,
  ListCheck,
  ListEnd,
  ListRestart,
  ListTree,
  Mouse,
  MousePointerClick,
  Move,
  Network,
  RotateCw,
  Scaling,
  ScanEye,
  Skull,
  SquareArrowDownRight,
  SquareArrowUpLeft,
  SquareDashedMousePointer,
  TextCursorInput,
  TextSelect,
  Touchpad,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Control() {
  const { t } = useTranslation("controlSettingsGroup");

  return (
    <>
      <FieldGroup title={t("mouse.title")} icon={<Mouse />}>
        <SettingField icon={<MousePointerClick />} settingKey="mouseRightDragBackground" type="select" />
        <SettingField icon={<AlignStartVertical />} settingKey="enableDragAutoAlign" type="switch" />
        <SettingField icon={<Mouse />} settingKey="mouseWheelMode" type="select" />
        <SettingField icon={<Mouse />} settingKey="mouseWheelWithShiftMode" type="select" />
        <SettingField icon={<Mouse />} settingKey="mouseWheelWithCtrlMode" type="select" />
        <SettingField icon={<Mouse />} settingKey="mouseWheelWithAltMode" type="select" />
        <SettingField icon={<Mouse />} settingKey="doubleClickMiddleMouseButton" type="select" />
        <SettingField icon={<Grab />} settingKey="mouseSideWheelMode" type="select" />
        {isMac && <SettingField icon={<Mouse />} settingKey="macMouseWheelIsSmoothed" type="switch" />}
      </FieldGroup>
      <FieldGroup title={t("touchpad.title")} icon={<Touchpad />}>
        <SettingField icon={<Hand />} settingKey="enableWindowsTouchPad" type="switch" />
        {isMac && <SettingField icon={<Hand />} settingKey="macTrackpadAndMouseWheelDifference" type="select" />}
        {isMac && (
          <SettingField
            icon={<HandMetal />}
            settingKey="macTrackpadScaleSensitivity"
            type="slider"
            min={0}
            max={1}
            step={0.1}
          />
        )}
      </FieldGroup>
      <FieldGroup title={t("cameraMove.title")} icon={<Fullscreen />}>
        <SettingField icon={<Keyboard />} settingKey="allowMoveCameraByWSAD" type="switch" />
        <SettingField icon={<Crosshair />} settingKey="cameraFollowsSelectedNodeOnArrowKeys" type="switch" />
        <SettingField icon={<Keyboard />} settingKey="cameraKeyboardMoveReverse" type="switch" />
        <SettingField icon={<Move />} settingKey="moveAmplitude" type="slider" min={0} max={10} step={0.1} />
        <SettingField icon={<Move />} settingKey="moveFriction" type="slider" min={0} max={1} step={0.01} />
      </FieldGroup>
      <FieldGroup title={t("cameraZoom.title")} icon={<Scaling />}>
        <SettingField icon={<ScanEye />} settingKey="scaleExponent" type="slider" min={0} max={1} step={0.01} />
        <SettingField
          icon={<Fullscreen />}
          settingKey="cameraResetViewPaddingRate"
          type="slider"
          min={1}
          max={2}
          step={0.05}
        />
        <SettingField icon={<ScanEye />} settingKey="scaleCameraByMouseLocation" type="switch" />
        <SettingField
          icon={<ScanEye />}
          settingKey="cameraKeyboardScaleRate"
          type="slider"
          min={0}
          max={3}
          step={0.1}
        />
      </FieldGroup>
      <FieldGroup title={t("rectangleSelect.title")} icon={<SquareDashedMousePointer />}>
        <SettingField icon={<SquareArrowDownRight />} settingKey="rectangleSelectWhenRight" type="select" />
        <SettingField icon={<SquareArrowUpLeft />} settingKey="rectangleSelectWhenLeft" type="select" />
      </FieldGroup>

      <FieldGroup title={t("textNode.title")} icon={<TextSelect />}>
        <SettingField icon={<ListRestart />} settingKey="textNodeStartEditMode" type="select" />
        <SettingField icon={<ListEnd />} settingKey="textNodeContentLineBreak" type="select" />
        <SettingField icon={<ListCheck />} settingKey="textNodeExitEditMode" type="select" />
        <SettingField
          icon={<TextCursorInput />}
          settingKey="textNodeSelectAllWhenStartEditByMouseClick"
          type="switch"
        />
        <SettingField icon={<TextCursorInput />} settingKey="textNodeSelectAllWhenStartEditByKeyboard" type="switch" />
      </FieldGroup>

      <FieldGroup title={t("edge.title")} icon={<GitCompareArrows />}>
        <SettingField icon={<RotateCw />} settingKey="allowAddCycleEdge" type="switch" />
      </FieldGroup>
      <FieldGroup title={t("generateNode.title")} icon={<Network className="-rotate-90" />}>
        <SettingField icon={<ListTree />} settingKey="autoLayoutWhenTreeGenerate" type="switch" />
      </FieldGroup>

      <FieldGroup title={t("gamepad.title")} icon={<Gamepad2 />}>
        <SettingField icon={<Skull />} settingKey="gamepadDeadzone" type="slider" min={0} max={1} step={0.01} />
      </FieldGroup>
      {/* 已经有快捷键专栏了，这里不再显示快捷键相关 */}
    </>
  );
}
