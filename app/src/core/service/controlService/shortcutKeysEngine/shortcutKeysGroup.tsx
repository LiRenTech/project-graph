/**
 * 专门给各种快捷键分组
 */

type ShortcutKeysGroup = {
  title: string;
  keys: string[];
};

export const shortcutKeysGroups: ShortcutKeysGroup[] = [
  {
    title: "basic",
    keys: [
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
    keys: [
      "resetView",
      "resetCameraScale",
      "masterBrakeCheckout",
      "masterBrakeControl",
      "CameraScaleZoomIn",
      "CameraScaleZoomOut",
    ],
  },
  {
    title: "app",
    keys: ["switchDebugShow", "exitSoftware", "checkoutProtectPrivacy", "reload"],
  },
  {
    title: "ui",
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
    keys: ["selectEntityByPenStroke", "penStrokeWidthIncrease", "penStrokeWidthDecrease"],
  },
  {
    title: "moveEntity",
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
    keys: ["generateNodeTreeWithDeepMode", "generateNodeTreeWithBroadMode", "generateNodeGraph"],
  },
  {
    title: "generateTextNodeRoundedSelectedNode",
    keys: [
      "createTextNodeFromSelectedTop",
      "createTextNodeFromSelectedDown",
      "createTextNodeFromSelectedLeft",
      "createTextNodeFromSelectedRight",
    ],
  },
  {
    title: "createTextNode",
    keys: ["createTextNodeFromCameraLocation", "createTextNodeFromMouseLocation"],
  },
  {
    title: "section",
    keys: ["folderSection", "packEntityToSection", "unpackEntityFromSection", "textNodeToSection"],
  },
  {
    title: "leftMouseModeCheckout",
    keys: [
      "checkoutLeftMouseToSelectAndMove",
      "checkoutLeftMouseToDrawing",
      "checkoutLeftMouseToConnectAndCutting",
      "checkoutLeftMouseToConnectAndCuttingOnlyPressed",
    ],
  },
  {
    title: "edge",
    keys: ["reverseEdges", "reverseSelectedNodeEdge"],
  },
];
