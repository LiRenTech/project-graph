import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SettingField } from "@/components/ui/field";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  AppWindowMac,
  ArrowUpRight,
  Bot,
  Box,
  Brain,
  Bug,
  Camera,
  Clock,
  Cpu,
  Eye,
  Folder,
  Gamepad,
  Layers,
  MemoryStick,
  Mouse,
  Network,
  PictureInPicture,
  ReceiptText,
  Save,
  Sparkle,
  SquareDashedMousePointer,
  Text,
  TextSelect,
  Touchpad,
  Workflow,
  Wrench,
  Zap,
  ZoomIn,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SettingsTab() {
  const { t } = useTranslation("settings");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentGroup, setCurrentGroup] = useState("");

  return (
    <div className="flex h-full">
      <Sidebar className="h-full overflow-auto">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Object.entries(categories).map(([category, value]) => {
                  // @ts-expect-error fuck ts
                  const CategoryIcon = categoryIcons[category].icon;
                  return (
                    <Collapsible key={category} defaultOpen className="group/collapsible">
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <CollapsibleTrigger>
                            <CategoryIcon />
                            <span>{t(`categories.${category}.title`)}</span>
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </CollapsibleTrigger>
                        </SidebarMenuButton>
                        <SidebarMenuSub>
                          <CollapsibleContent>
                            {Object.entries(value).map(([group]) => {
                              // @ts-expect-error fuck ts
                              const GroupIcon = categoryIcons[category][group];
                              return (
                                <SidebarMenuSubItem key={group}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={category === currentCategory && group === currentGroup}
                                    onClick={() => {
                                      setCurrentCategory(category);
                                      setCurrentGroup(group);
                                    }}
                                  >
                                    <a href="#">
                                      <GroupIcon />
                                      <span>{t(`categories.${category}.${group}`)}</span>
                                    </a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </CollapsibleContent>
                        </SidebarMenuSub>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="mx-auto flex w-2/3 flex-col overflow-auto">
        {currentCategory &&
          currentGroup &&
          // @ts-expect-error fuck ts
          categories[currentCategory][currentGroup].map((key) => <SettingField key={key} settingKey={key} />)}
      </div>
    </div>
  );
}

const categories = {
  ai: {
    api: ["aiApiBaseUrl", "aiApiKey", "aiModel", "aiShowTokenCount"],
  },
  automation: {
    autoNamer: ["autoNamerTemplate", "autoNamerSectionTemplate"],
    autoSave: ["autoSaveWhenClose", "autoSave", "autoSaveInterval"],
    autoBackup: ["autoBackup", "autoBackupInterval", "autoBackupLimitCount", "autoBackupDraftPath"],
  },
  control: {
    mouse: [
      "mouseRightDragBackground",
      "enableDragAutoAlign",
      "mouseWheelMode",
      "mouseWheelWithShiftMode",
      "mouseWheelWithCtrlMode",
      "mouseWheelWithAltMode",
      "doubleClickMiddleMouseButton",
      "mouseSideWheelMode",
      "macMouseWheelIsSmoothed",
    ],
    touchpad: ["enableWindowsTouchPad", "macTrackpadAndMouseWheelDifference", "macTrackpadScaleSensitivity"],
    cameraMove: [
      "allowMoveCameraByWSAD",
      "cameraFollowsSelectedNodeOnArrowKeys",
      "cameraKeyboardMoveReverse",
      "moveAmplitude",
      "moveFriction",
    ],
    cameraZoom: [
      "scaleExponent",
      "cameraResetViewPaddingRate",
      "scaleCameraByMouseLocation",
      "cameraKeyboardScaleRate",
    ],
    rectangleSelect: ["rectangleSelectWhenRight", "rectangleSelectWhenLeft"],
    textNode: [
      "textNodeStartEditMode",
      "textNodeContentLineBreak",
      "textNodeExitEditMode",
      "textNodeSelectAllWhenStartEditByMouseClick",
      "textNodeSelectAllWhenStartEditByKeyboard",
    ],
    edge: ["allowAddCycleEdge"],
    generateNode: ["autoLayoutWhenTreeGenerate"],
    gamepad: ["gamepadDeadzone"],
  },
  performance: {
    memory: ["historySize"],
    cpu: ["autoRefreshStageByMouseAction"],
    render: [
      "isPauseRenderWhenManipulateOvertime",
      "renderOverTimeWhenNoManipulateTime",
      "scaleExponent",
      "ignoreTextNodeTextRenderLessThanCameraScale",
      "textCacheSize",
      "textScalingBehavior",
      "antialiasing",
    ],
    experimental: ["compatibilityMode", "isEnableEntityCollision"],
  },
  visual: {
    basic: ["language", "showTipsOnUI", "useNativeTitleBar", "isClassroomMode", "windowBackgroundAlpha"],
    background: [
      "isRenderCenterPointer",
      "showBackgroundHorizontalLines",
      "showBackgroundVerticalLines",
      "showBackgroundDots",
      "showBackgroundCartesian",
    ],
    node: ["enableTagTextNodesBigDisplay", "showTextNodeBorder"],
    edge: ["lineStyle"],
    section: ["sectionBitTitleRenderType"],
    entityDetails: [
      "nodeDetailsPanel",
      "alwaysShowDetails",
      "entityDetailsFontSize",
      "entityDetailsLinesLimit",
      "entityDetailsWidthLimit",
    ],
    debug: ["showDebug", "protectingPrivacy"],
    miniWindow: ["windowCollapsingWidth", "windowCollapsingHeight"],
    experimental: ["limitCameraInCycleSpace", "cameraCycleSpaceSizeX", "cameraCycleSpaceSizeY"],
  },
};

const categoryIcons = {
  ai: {
    icon: Brain,
    api: Network,
  },
  automation: {
    icon: Bot,
    autoNamer: Text,
    autoSave: Save,
    autoBackup: Folder,
  },
  control: {
    icon: Wrench,
    mouse: Mouse,
    touchpad: Touchpad,
    cameraMove: Camera,
    cameraZoom: ZoomIn,
    rectangleSelect: SquareDashedMousePointer,
    textNode: TextSelect,
    edge: ArrowUpRight,
    generateNode: Network,
    gamepad: Gamepad,
  },
  performance: {
    icon: Zap,
    memory: MemoryStick,
    cpu: Cpu,
    render: Clock,
    experimental: Sparkle,
  },
  visual: {
    icon: Eye,
    basic: AppWindowMac,
    background: Layers,
    node: Workflow,
    edge: ArrowUpRight,
    section: Box,
    entityDetails: ReceiptText,
    debug: Bug,
    miniWindow: PictureInPicture,
    experimental: Sparkle,
  },
};
