import { Dialog } from "../../../../components/dialog";
import { Popup } from "../../../../components/popup";
import ColorPanel from "../../../../pages/_popup_panel/_color_panel";
import SearchingNodePanel from "../../../../pages/_popup_panel/_searching_node_panel";
import { Direction } from "../../../../types/directions";
import { openBrowserOrFile } from "../../../../utils/externalOpen";
import { openDevtools, writeStdout } from "../../../../utils/otherApi";
import { isMac } from "../../../../utils/platform";
import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";
import { Renderer } from "../../../render/canvas2d/renderer";
import { Camera } from "../../../stage/Camera";
import { LeftMouseModeEnum, Stage } from "../../../stage/Stage";
import { PenStrokeMethods } from "../../../stage/stageManager/basicMethods/PenStrokeMethods";
import { StageEntityMoveManager } from "../../../stage/stageManager/concreteMethods/StageEntityMoveManager";
import { StageSectionPackManager } from "../../../stage/stageManager/concreteMethods/StageSectionPackManager";
import { StageHistoryManager } from "../../../stage/stageManager/StageHistoryManager";
import { StageManager } from "../../../stage/stageManager/StageManager";
import { CopyEngine } from "../../dataManageService/copyEngine/copyEngine";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewOutlineFlashEffect } from "../../feedbackService/effectEngine/concrete/ViewOutlineFlashEffect";
import { StageStyleManager } from "../../feedbackService/stageStyle/StageStyleManager";
import { Settings } from "../../Settings";
import {
  addTextNodeByLocation,
  addTextNodeFromCurrentSelectedNode,
  editNodeDetailsByKeyboard,
} from "../controller/concrete/utilsControl";
import { Controller } from "../controller/Controller";
import { KeyboardOnlyGraphEngine } from "../keyboardOnlyEngine/keyboardOnlyGraphEngine";
import { KeyboardOnlyTreeEngine } from "../keyboardOnlyEngine/keyboardOnlyTreeEngine";
import { MouseLocation } from "../MouseLocation";
import { KeyBinds } from "./KeyBinds";

/**
 * 快捷键注册函数，仅在软件启动的时候调用一次
 */
export namespace ShortcutKeysRegister {
  /**
   * 注册所有快捷键
   */
  export async function registerKeyBinds() {
    // 开始注册快捷键
    (
      await KeyBinds.create("test", "t", {
        control: true,
        alt: true,
        shift: true,
      })
    ).down(() =>
      Dialog.show({
        title: "自定义快捷键测试",
        content: "您按下了自定义的测试快捷键，这一功能是测试开发所用，可在设置中更改触发方式",
        buttons: [
          {
            text: "ok",
          },
          {
            text: "open devtools",
            onClick: () => {
              openDevtools();
            },
          },
          {
            text: "write stdout",
            onClick: () => {
              writeStdout("test");
            },
          },
        ],
      }),
    );

    (
      await KeyBinds.create("undo", "z", {
        control: isMac ? false : true,
        alt: false,
        shift: false,
        meta: isMac,
      })
    ).down(() => {
      StageHistoryManager.undo();
    });

    (
      await KeyBinds.create("redo", "y", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageHistoryManager.redo();
    });

    // 危险操作，配置一个不容易触发的快捷键
    (
      await KeyBinds.create("reload", "F5", {
        control: isMac ? false : true,
        meta: isMac,
        alt: true,
        shift: true,
      })
    ).down(() => {
      Dialog.show({
        title: "重新加载应用",
        type: "warning",
        content:
          "此快捷键用于在废档了或软件卡住了的情况下重启，您按下了重新加载应用快捷键，是否要重新加载应用？这会导致您丢失所有未保存的工作。",
        buttons: [
          {
            text: "是",
            onClick: () => {
              window.location.reload();
            },
          },
          {
            text: "否",
            onClick: () => {},
          },
        ],
      });
    });
    (
      await KeyBinds.create("checkoutClassroomMode", "F5", {
        control: false,
        alt: false,
        shift: false,
      })
    ).up(async () => {
      // F5 是PPT的播放快捷键
      Settings.set("isClassroomMode", !(await Settings.get("isClassroomMode")));
    });

    (
      await KeyBinds.create("resetView", "F", {
        control: false,
        alt: false,
        shift: false,
      })
    ).down(() => {
      Camera.resetBySelected();
    });

    (
      await KeyBinds.create("resetCameraScale", "r", {
        control: isMac ? false : true,
        meta: isMac,
        alt: true,
        shift: false,
      })
    ).down(() => {
      Camera.resetScale();
    });

    (
      await KeyBinds.create("CameraScaleZoomIn", "[", {
        control: false,
        alt: false,
        shift: false,
      })
    ).down(() => {
      Camera.zoomInByKeyboard();
    });

    (
      await KeyBinds.create("CameraScaleZoomOut", "]", {
        control: false,
        alt: false,
        shift: false,
      })
    ).down(() => {
      Camera.zoomOutByKeyboard();
    });

    (
      await KeyBinds.create("folderSection", "t", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageManager.sectionSwitchCollapse();
    });

    (
      await KeyBinds.create("reverseEdges", "t", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageManager.reverseSelectedEdges();
    });
    (
      await KeyBinds.create("reverseSelectedNodeEdge", "t", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageManager.reverseSelectedNodeEdge();
    });

    (
      await KeyBinds.create("packEntityToSection", "g", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageManager.packEntityToSectionBySelected();
    });

    (
      await KeyBinds.create("deleteSelectedStageObjects", "delete", {
        control: false,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageManager.deleteSelectedStageObjects();
    });

    (
      await KeyBinds.create("createTextNodeFromCameraLocation", "insert", {
        control: false,
        alt: false,
        shift: false,
      })
    ).down(() => {
      Camera.clearMoveCommander();
      Camera.speed = Vector.getZero();
      addTextNodeByLocation(Camera.location, true);
    });
    (
      await KeyBinds.create("createTextNodeFromMouseLocation", "insert", {
        control: false,
        alt: false,
        shift: true,
      })
    ).down(() => {
      Camera.clearMoveCommander();
      Camera.speed = Vector.getZero();
      addTextNodeByLocation(Renderer.transformView2World(MouseLocation.vector()), true);
    });

    (
      await KeyBinds.create("createTextNodeFromSelectedTop", "arrowup", {
        control: false,
        alt: true,
        shift: false,
      })
    ).down(() => {
      addTextNodeFromCurrentSelectedNode(Direction.Up, true);
    });

    (
      await KeyBinds.create("createTextNodeFromSelectedRight", "arrowright", {
        control: false,
        alt: true,
        shift: false,
      })
    ).down(() => {
      addTextNodeFromCurrentSelectedNode(Direction.Right, true);
    });

    (
      await KeyBinds.create("createTextNodeFromSelectedLeft", "arrowleft", {
        control: false,
        alt: true,
        shift: false,
      })
    ).down(() => {
      addTextNodeFromCurrentSelectedNode(Direction.Left, true);
    });

    (
      await KeyBinds.create("createTextNodeFromSelectedDown", "arrowdown", {
        control: false,
        alt: true,
        shift: false,
      })
    ).down(() => {
      addTextNodeFromCurrentSelectedNode(Direction.Down, true);
    });

    (
      await KeyBinds.create("moveUpSelectedEntities", "arrowup", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageEntityMoveManager.moveSelectedEntities(new Vector(0, -100));
    });

    (
      await KeyBinds.create("moveDownSelectedEntities", "arrowdown", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageEntityMoveManager.moveSelectedEntities(new Vector(0, 100));
    });

    (
      await KeyBinds.create("moveLeftSelectedEntities", "arrowleft", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageEntityMoveManager.moveSelectedEntities(new Vector(-100, 0));
    });

    (
      await KeyBinds.create("moveRightSelectedEntities", "arrowright", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageEntityMoveManager.moveSelectedEntities(new Vector(100, 0));
    });
    (
      await KeyBinds.create("jumpMoveUpSelectedEntities", "arrowup", {
        control: isMac ? false : true,
        meta: isMac,
        alt: true,
        shift: false,
      })
    ).down(() => {
      StageEntityMoveManager.jumpMoveSelectedConnectableEntities(new Vector(0, -100));
    });

    (
      await KeyBinds.create("jumpMoveDownSelectedEntities", "arrowdown", {
        control: isMac ? false : true,
        meta: isMac,
        alt: true,
        shift: false,
      })
    ).down(() => {
      StageEntityMoveManager.jumpMoveSelectedConnectableEntities(new Vector(0, 100));
    });

    (
      await KeyBinds.create("jumpMoveLeftSelectedEntities", "arrowleft", {
        control: isMac ? false : true,
        meta: isMac,
        alt: true,
        shift: false,
      })
    ).down(() => {
      StageEntityMoveManager.jumpMoveSelectedConnectableEntities(new Vector(-100, 0));
    });

    (
      await KeyBinds.create("jumpMoveRightSelectedEntities", "arrowright", {
        control: isMac ? false : true,
        meta: isMac,
        alt: true,
        shift: false,
      })
    ).down(() => {
      StageEntityMoveManager.jumpMoveSelectedConnectableEntities(new Vector(100, 0));
    });

    (
      await KeyBinds.create("editEntityDetails", "enter", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      editNodeDetailsByKeyboard();
    });

    (
      await KeyBinds.create("openColorPanel", "F6", {
        control: false,
        alt: false,
        shift: false,
      })
    ).down(() => {
      Popup.show(<ColorPanel />, true);
    });
    (
      await KeyBinds.create("switchDebugShow", "F3", {
        control: false,
        alt: false,
        shift: false,
      })
    ).down(() => {
      const currentValue = Renderer.isShowDebug;
      Settings.set("showDebug", !currentValue);
    });

    (
      await KeyBinds.create("selectAll", "a", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      StageManager.selectAll();
      Stage.effectMachine.addEffect(ViewOutlineFlashEffect.normal(Color.Green));
    });
    (
      await KeyBinds.create("textNodeToSection", "g", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: true,
      })
    ).down(() => {
      StageSectionPackManager.textNodeToSection();
    });
    (
      await KeyBinds.create("unpackEntityFromSection", "g", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: true,
      })
    ).down(() => {
      StageSectionPackManager.unpackSelectedSections();
    });
    (
      await KeyBinds.create("checkoutProtectPrivacy", "2", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      Settings.set("protectingPrivacy", !Renderer.protectingPrivacy);
    });
    (
      await KeyBinds.create("searchText", "f", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      Popup.show(<SearchingNodePanel />, false);
    });
    (
      await KeyBinds.create("openTextNodeByContentExternal", "e", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: true,
      })
    ).down(() => {
      openBrowserOrFile();
    });

    (
      await KeyBinds.create("clickAppMenuSettingsButton", "!", {
        control: false,
        alt: false,
        shift: true,
      })
    ).down(() => {
      console.log(location.pathname);
      const AppBackToHomeButton = document.getElementById("close-popin-btn");
      const isPageInHome = AppBackToHomeButton === null;
      if (isPageInHome) {
        const button = document.getElementById("app-menu-settings-btn");
        console.log(button);

        const event = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        button?.dispatchEvent(event);
        setTimeout(() => {
          Controller.pressingKeySet.clear();
        }, 200);
      } else {
        // 说明已经不再主页面了

        // 回到主页面
        const closeButton = document.getElementById("close-popin-btn");
        console.log(closeButton);

        const event = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        closeButton?.dispatchEvent(event);
        setTimeout(() => {
          Controller.pressingKeySet.clear();
        }, 200);
      }
    });
    (
      await KeyBinds.create("clickTagPanelButton", "@", {
        control: false,
        alt: false,
        shift: true,
      })
    ).down(() => {
      const button = document.getElementById("tagPanelBtn");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      button?.dispatchEvent(event);
    });
    (
      await KeyBinds.create("clickAppMenuRecentFileButton", "#", {
        control: false,
        alt: false,
        shift: true,
      })
    ).down(() => {
      const isRecentFilePanelOpening = document.getElementById("recent-files-panel-open-mark-div") !== null;
      if (isRecentFilePanelOpening) {
        const closeButton = document.getElementById("recent-files-panel-close-btn");
        const event = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        closeButton?.dispatchEvent(event);
      } else {
        const button = document.getElementById("app-menu-recent-file-btn");
        const event = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        button?.dispatchEvent(event);
      }
    });
    (
      await KeyBinds.create("clickStartFilePanelButton", "$", {
        control: false,
        alt: false,
        shift: true,
      })
    ).down(() => {
      const button = document.getElementById("app-start-file-btn");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      button?.dispatchEvent(event);
    });
    (
      await KeyBinds.create("saveFile", "s", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      const button = document.getElementById("app-menu-save-btn");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      button?.dispatchEvent(event);
    });
    (
      await KeyBinds.create("newDraft", "n", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      const button = document.getElementById("app-menu-new-draft-btn");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      button?.dispatchEvent(event);
    });
    (
      await KeyBinds.create("openFile", "o", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(() => {
      const button = document.getElementById("app-menu-open-btn");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      button?.dispatchEvent(event);
    });

    (
      await KeyBinds.create("checkoutWindowOpacityMode", "0", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      // 切换窗口透明度模式
      const currentValue = await Settings.get("windowBackgroundAlpha");
      if (currentValue === 0) {
        Settings.set("windowBackgroundAlpha", 1);
      } else {
        Settings.set("windowBackgroundAlpha", 0);
      }
    });
    (
      await KeyBinds.create("windowOpacityAlphaIncrease", "+", {
        control: isMac ? false : true,
        meta: isMac,
        alt: true,
        shift: true,
      })
    ).down(async () => {
      const currentValue = await Settings.get("windowBackgroundAlpha");
      if (currentValue === 1) {
        // 已经不能再大了
        Stage.effectMachine.addEffect(ViewOutlineFlashEffect.short(StageStyleManager.currentStyle.effects.flash));
      } else {
        Settings.set("windowBackgroundAlpha", Math.min(1, currentValue + 0.2));
      }
    });
    (
      await KeyBinds.create("windowOpacityAlphaDecrease", "-", {
        control: isMac ? false : true,
        meta: isMac,
        alt: true,
        shift: true,
      })
    ).down(async () => {
      const currentValue = await Settings.get("windowBackgroundAlpha");
      if (currentValue === 0) {
        // 已经不能再小了
        Stage.effectMachine.addEffect(ViewOutlineFlashEffect.short(StageStyleManager.currentStyle.effects.flash));
      } else {
        Settings.set("windowBackgroundAlpha", Math.max(0, currentValue - 0.2));
      }
    });

    (
      await KeyBinds.create("penStrokeWidthIncrease", "=", {
        control: false,
        meta: false,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      if (Stage.leftMouseMode === LeftMouseModeEnum.draw) {
        const newWidth = Stage.drawingMachine.currentStrokeWidth + 4;
        Stage.drawingMachine.currentStrokeWidth = Math.max(1, Math.min(newWidth, 1000));
        Stage.effectMachine.addEffect(TextRiseEffect.default(`${Stage.drawingMachine.currentStrokeWidth}px`));
      }
    });
    (
      await KeyBinds.create("penStrokeWidthDecrease", "-", {
        control: false,
        meta: false,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      if (Stage.leftMouseMode === LeftMouseModeEnum.draw) {
        const newWidth = Stage.drawingMachine.currentStrokeWidth - 4;
        Stage.drawingMachine.currentStrokeWidth = Math.max(1, Math.min(newWidth, 1000));
        Stage.effectMachine.addEffect(TextRiseEffect.default(`${Stage.drawingMachine.currentStrokeWidth}px`));
      }
    });

    (
      await KeyBinds.create("copy", "c", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      CopyEngine.copy();
    });
    (
      await KeyBinds.create("paste", "v", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      CopyEngine.paste();
    });

    (
      await KeyBinds.create("pasteWithOriginLocation", "v", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: true,
      })
    ).down(async () => {
      CopyEngine.pasteWithOriginLocation();
    });

    (
      await KeyBinds.create("checkoutLeftMouseToSelectAndMove", "v", {
        control: false,
        meta: false,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      Stage.MouseModeManager.checkoutSelectAndMoveHook();
    });
    (
      await KeyBinds.create("checkoutLeftMouseToDrawing", "p", {
        control: false,
        meta: false,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      Stage.MouseModeManager.checkoutDrawingHook();
    });

    // 鼠标左键切换为连接模式
    // let lastMouseMode = LeftMouseModeEnum.selectAndMove;
    (
      await KeyBinds.create("checkoutLeftMouseToConnectAndCutting", "c", {
        control: false,
        meta: false,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      Stage.MouseModeManager.checkoutConnectAndCuttingHook();
    });

    (
      await KeyBinds.create("checkoutLeftMouseToConnectAndCuttingOnlyPressed", "z", {
        control: false,
        meta: false,
        alt: false,
        shift: false,
      })
    )
      .down(async () => {
        // lastMouseMode = Stage.leftMouseMode;
        Stage.MouseModeManager.checkoutConnectAndCuttingHook();
      })
      .up(async () => {
        Stage.MouseModeManager.checkoutSelectAndMoveHook();
      });

    (
      await KeyBinds.create("selectEntityByPenStroke", "w", {
        control: isMac ? false : true,
        meta: isMac,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      PenStrokeMethods.selectEntityByPenStroke();
    });

    (
      await KeyBinds.create("generateNodeTreeWithDeepMode", "tab", {
        control: false,
        meta: false,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      KeyboardOnlyTreeEngine.onDeepGenerateNode();
    });

    (
      await KeyBinds.create("masterBrakeControl", "pause", {
        control: false,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      // 按下一次就清空动力
      Camera.clearMoveCommander();
      Camera.speed = Vector.getZero();
    });

    (
      await KeyBinds.create("masterBrakeCheckout", "space", {
        control: false,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      // 看成汽车的手刹，按下一次就切换是否允许移动
      Camera.clearMoveCommander();
      Camera.speed = Vector.getZero();
      Settings.set("allowMoveCameraByWSAD", !(await Settings.get("allowMoveCameraByWSAD")));
    });

    (
      await KeyBinds.create("generateNodeTreeWithBroadMode", "\\", {
        control: false,
        meta: false,
        alt: false,
        shift: false,
      })
    ).down(async () => {
      KeyboardOnlyTreeEngine.onBroadGenerateNode();
    });

    (
      await KeyBinds.create("generateNodeGraph", "`", {
        control: false,
        alt: false,
        meta: false,
        shift: false,
      })
    )
      .down(() => {
        if (KeyboardOnlyGraphEngine.isEnableVirtualCreate()) {
          KeyboardOnlyGraphEngine.createStart();
        }
      })
      .up(() => {
        if (KeyboardOnlyGraphEngine.isCreating()) {
          KeyboardOnlyGraphEngine.createFinished();
        }
      });
  }
}
