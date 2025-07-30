/**
 * 专门给各种快捷键分组
 */

import {
  AppWindow,
  Brush,
  Fullscreen,
  Keyboard,
  MousePointer,
  Move,
  Network,
  PanelsTopLeft,
  Scan,
  SendToBack,
  Spline,
  Split,
  SquareDashed,
  SquareMenu,
  SunMoon,
} from "lucide-react";

type ShortcutKeysGroup = {
  title: string;
  icon: React.ReactNode;
  keys: string[];
};

export const shortcutKeysGroups: ShortcutKeysGroup[] = [
  {
    title: "basic",
    icon: <Keyboard />,
    keys: [
      "saveFile",
      "openFile",
      "newDraft",
      "undo",
      "redo",
      "selectAll",
      "searchText",
      "copy",
      "paste",
      "pasteWithOriginLocation",
      "deleteSelectedStageObjects",
    ],
  },
  {
    title: "camera",
    icon: <Fullscreen />,
    keys: [
      "resetView",
      "resetCameraScale",
      "masterBrakeCheckout",
      "masterBrakeControl",
      "CameraScaleZoomIn",
      "CameraScaleZoomOut",
      "CameraPageMoveUp",
      "CameraPageMoveDown",
      "CameraPageMoveLeft",
      "CameraPageMoveRight",
    ],
  },
  {
    title: "app",
    icon: <AppWindow />,
    keys: ["switchDebugShow", "exitSoftware", "checkoutProtectPrivacy", "reload"],
  },
  {
    title: "ui",
    icon: <PanelsTopLeft />,
    keys: [
      "checkoutClassroomMode",
      "checkoutWindowOpacityMode",
      "windowOpacityAlphaIncrease",
      "windowOpacityAlphaDecrease",
      "openColorPanel",
      "clickAppMenuSettingsButton",
      "clickTagPanelButton",
      "clickAppMenuRecentFileButton",
      "clickStartFilePanelButton",
    ],
  },
  {
    title: "draw",
    icon: <Brush />,
    keys: ["selectEntityByPenStroke", "penStrokeWidthIncrease", "penStrokeWidthDecrease"],
  },
  {
    title: "select",
    icon: <Scan />,
    keys: [
      "selectUp",
      "selectDown",
      "selectLeft",
      "selectRight",
      "selectAdditionalUp",
      "selectAdditionalDown",
      "selectAdditionalLeft",
      "selectAdditionalRight",
    ],
  },
  {
    title: "expandSelect",
    icon: <Split className="rotate-90" />,
    keys: [
      "expandSelectEntity",
      "expandSelectEntityReversed",
      "expandSelectEntityKeepLastSelected",
      "expandSelectEntityReversedKeepLastSelected",
    ],
  },
  {
    title: "moveEntity",
    icon: <Move />,
    keys: [
      "moveUpSelectedEntities",
      "moveDownSelectedEntities",
      "moveLeftSelectedEntities",
      "moveRightSelectedEntities",
      "jumpMoveUpSelectedEntities",
      "jumpMoveDownSelectedEntities",
      "jumpMoveLeftSelectedEntities",
      "jumpMoveRightSelectedEntities",
    ],
  },

  {
    title: "generateTextNodeInTree",
    icon: <Network className="-rotate-90" />,
    keys: ["generateNodeTreeWithDeepMode", "generateNodeTreeWithBroadMode", "generateNodeGraph", "treeGraphAdjust"],
  },
  {
    title: "generateTextNodeRoundedSelectedNode",
    icon: <SendToBack />,
    keys: [
      "createTextNodeFromSelectedTop",
      "createTextNodeFromSelectedDown",
      "createTextNodeFromSelectedLeft",
      "createTextNodeFromSelectedRight",
    ],
  },
  {
    title: "aboutTextNode",
    icon: <SquareMenu />,
    keys: [
      "createTextNodeFromCameraLocation",
      "createTextNodeFromMouseLocation",
      "toggleTextNodeSizeMode",
      "splitTextNodes",
      "mergeTextNodes",
      "swapTextAndDetails",
    ],
  },
  {
    title: "section",
    icon: <SquareDashed />,
    keys: ["folderSection", "packEntityToSection", "unpackEntityFromSection", "textNodeToSection"],
  },
  {
    title: "leftMouseModeCheckout",
    icon: <MousePointer />,
    keys: [
      "checkoutLeftMouseToSelectAndMove",
      "checkoutLeftMouseToDrawing",
      "checkoutLeftMouseToConnectAndCutting",
      "checkoutLeftMouseToConnectAndCuttingOnlyPressed",
    ],
  },
  {
    title: "edge",
    icon: <Spline />,
    keys: [
      "reverseEdges",
      "reverseSelectedNodeEdge",
      "createUndirectedEdgeFromEntities",
      "connectAllSelectedEntities",
      "connectLeftToRight",
      "connectTopToBottom",
      "selectAllEdges",
    ],
  },
  {
    title: "themes",
    icon: <SunMoon />,
    keys: [
      "switchToDarkTheme",
      "switchToLightTheme",
      "switchToParkTheme",
      "switchToMacaronTheme",
      "switchToMorandiTheme",
    ],
  },
  {
    title: "align",
    icon: <Spline />,
    keys: [
      "alignTop",
      "alignBottom",
      "alignLeft",
      "alignRight",
      "alignHorizontalSpaceBetween",
      "alignVerticalSpaceBetween",
      "alignCenterHorizontal",
      "alignCenterVertical",
      "alignLeftToRightNoSpace",
      "alignTopToBottomNoSpace",
    ],
  },
];
