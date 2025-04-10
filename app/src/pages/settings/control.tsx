import {
  AlignStartVertical,
  Crosshair,
  Fullscreen,
  GitCompareArrows,
  Hand,
  Keyboard,
  ListCheck,
  ListEnd,
  ListRestart,
  Mouse,
  MousePointerClick,
  Move,
  RotateCw,
  ScanEye,
  Skull,
  SquareArrowDownRight,
  SquareArrowUpLeft,
  SquareDashedMousePointer,
  TextCursorInput,
  TextSelect,
  Touchpad,
} from "lucide-react";
import { FieldGroup, SettingField } from "./_field";

export default function Control() {
  return (
    <>
      <FieldGroup title="Mouse 鼠标设定" icon={<Mouse />}>
        <SettingField icon={<MousePointerClick />} settingKey="mouseRightDragBackground" type="select" />
        <SettingField icon={<AlignStartVertical />} settingKey="enableDragAutoAlign" type="switch" />
        <SettingField icon={<Mouse />} settingKey="mouseWheelMode" type="select" />
        <SettingField icon={<Mouse />} settingKey="mouseWheelWithShiftMode" type="select" />
        <SettingField icon={<Mouse />} settingKey="mouseWheelWithCtrlMode" type="select" />
        <SettingField icon={<Mouse />} settingKey="mouseWheelWithAltMode" type="select" />
        <SettingField icon={<Mouse />} settingKey="doubleClickMiddleMouseButton" type="select" />
      </FieldGroup>
      <FieldGroup title="TouchPad 触摸板设定" icon={<Touchpad />}>
        <SettingField icon={<Hand />} settingKey="enableWindowsTouchPad" type="switch" />
      </FieldGroup>
      <FieldGroup title="RectangleSelect 框选" icon={<SquareDashedMousePointer />}>
        <SettingField icon={<SquareArrowDownRight />} settingKey="rectangleSelectWhenRight" type="select" />
        <SettingField icon={<SquareArrowUpLeft />} settingKey="rectangleSelectWhenLeft" type="select" />
      </FieldGroup>

      <FieldGroup title="TextNode 文本节点" icon={<TextSelect />}>
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

      <FieldGroup title="Edge 连线" icon={<GitCompareArrows />}>
        <SettingField icon={<RotateCw />} settingKey="allowAddCycleEdge" type="switch" />
      </FieldGroup>

      <FieldGroup title="Camera 摄像机/视野/相关" icon={<Fullscreen />}>
        <SettingField icon={<ScanEye />} settingKey="scaleExponent" type="slider" min={0} max={1} step={0.01} />
        <SettingField
          icon={<Fullscreen />}
          settingKey="cameraResetViewPaddingRate"
          type="slider"
          min={1}
          max={2}
          step={0.05}
        />
        <SettingField
          icon={<ScanEye />}
          settingKey="cameraKeyboardScaleRate"
          type="slider"
          min={0}
          max={3}
          step={0.1}
        />
        <SettingField icon={<ScanEye />} settingKey="scaleCameraByMouseLocation" type="switch" />
        <SettingField icon={<Keyboard />} settingKey="allowMoveCameraByWSAD" type="switch" />
        <SettingField icon={<Crosshair />} settingKey="cameraFollowsSelectedNodeOnArrowKeys" type="switch" />
        <SettingField icon={<Keyboard />} settingKey="cameraKeyboardMoveReverse" type="switch" />
        <SettingField icon={<Move />} settingKey="moveAmplitude" type="slider" min={0} max={10} step={0.1} />
        <SettingField icon={<Move />} settingKey="moveFriction" type="slider" min={0} max={1} step={0.01} />
        <SettingField icon={<Skull />} settingKey="gamepadDeadzone" type="slider" min={0} max={1} step={0.01} />
      </FieldGroup>
      {/* 已经有快捷键专栏了，这里不再显示快捷键相关 */}
    </>
  );
}
