import { Dialog } from "../../../../components/dialog";
import ColorWindow from "../../../../pages/_sub_window/ColorWindow";
import FindWindow from "../../../../pages/_sub_window/FindWindow";
import RecentFilesWindow from "../../../../pages/_sub_window/RecentFilesWindow";
import SettingsWindow from "../../../../pages/_sub_window/SettingsWindow";
import TagWindow from "../../../../pages/_sub_window/TagWindow";
import { Direction } from "../../../../types/directions";
import { openBrowserOrFile } from "../../../../utils/externalOpen";
import { openDevtools, writeStdout } from "../../../../utils/otherApi";
import { isMac } from "../../../../utils/platform";
import { Color } from "../../../dataStruct/Color";
import { Vector } from "../../../dataStruct/Vector";
import { Project, service } from "../../../Project";
import { PenStrokeMethods } from "../../../stage/stageManager/basicMethods/PenStrokeMethods";
import { ConnectableEntity } from "../../../stage/stageObject/abstract/ConnectableEntity";
import { MultiTargetUndirectedEdge } from "../../../stage/stageObject/association/MutiTargetUndirectedEdge";
import { RectangleSlideEffect } from "../../feedbackService/effectEngine/concrete/RectangleSlideEffect";
import { TextRiseEffect } from "../../feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewOutlineFlashEffect } from "../../feedbackService/effectEngine/concrete/ViewOutlineFlashEffect";
import { Settings } from "../../Settings";

/**
 * 快捷键注册函数
 */
@service("keyBindsRegistrar")
export class KeyBindsRegistrar {
  constructor(private readonly project: Project) {}

  /**
   * 注册所有快捷键
   */
  async registerKeyBinds() {
    // 开始注册快捷键
    await this.project.keyBinds.create("test", "C-A-S-t", () =>
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

    await this.project.keyBinds.create("undo", "C-z", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.stageHistoryManager.undo();
    });

    await this.project.keyBinds.create("redo", "C-y", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.stageHistoryManager.redo();
    });

    // 危险操作，配置一个不容易触发的快捷键
    await this.project.keyBinds.create("reload", "C-f5", () => {
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

    await this.project.keyBinds.create("checkoutClassroomMode", "F5", async () => {
      // F5 是PPT的播放快捷键
      await Settings.set("isClassroomMode", !(await Settings.get("isClassroomMode")));
    });

    await this.project.keyBinds.create("resetView", "F", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.camera.resetBySelected();
    });

    await this.project.keyBinds.create("resetCameraScale", "C-A-r", () => {
      this.project.camera.resetScale();
    });

    await this.project.keyBinds.create("CameraScaleZoomIn", "[", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.camera.zoomInByKeyboard();
    });

    await this.project.keyBinds.create("CameraScaleZoomOut", "]", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.camera.zoomOutByKeyboard();
    });

    if (isMac) {
      await this.project.keyBinds.create("CameraPageMoveUp", "S-i", () => {
        this.project.camera.pageMove(Direction.Up);
      });
      await this.project.keyBinds.create("CameraPageMoveDown", "S-k", () => {
        this.project.camera.pageMove(Direction.Down);
      });
      await this.project.keyBinds.create("CameraPageMoveLeft", "S-j", () => {
        this.project.camera.pageMove(Direction.Left);
      });
      await this.project.keyBinds.create("CameraPageMoveRight", "S-l", () => {
        this.project.camera.pageMove(Direction.Right);
      });
    } else {
      await this.project.keyBinds.create("CameraPageMoveUp", "pageup", () => {
        if (!this.project.keyboardOnlyEngine.isOpenning()) return;
        this.project.camera.pageMove(Direction.Up);
      });
      await this.project.keyBinds.create("CameraPageMoveDown", "pagedown", () => {
        if (!this.project.keyboardOnlyEngine.isOpenning()) return;
        this.project.camera.pageMove(Direction.Down);
      });
      await this.project.keyBinds.create("CameraPageMoveLeft", "home", () => {
        if (!this.project.keyboardOnlyEngine.isOpenning()) return;
        this.project.camera.pageMove(Direction.Left);
      });
      await this.project.keyBinds.create("CameraPageMoveRight", "end", () => {
        if (!this.project.keyboardOnlyEngine.isOpenning()) return;
        this.project.camera.pageMove(Direction.Right);
      });
    }

    await this.project.keyBinds.create("folderSection", "C-t", () => {
      this.project.stageManager.sectionSwitchCollapse();
    });

    await this.project.keyBinds.create("reverseEdges", "C-t", () => {
      this.project.stageManager.reverseSelectedEdges();
    });
    await this.project.keyBinds.create("reverseSelectedNodeEdge", "C-t", () => {
      this.project.stageManager.reverseSelectedNodeEdge();
    });

    await this.project.keyBinds.create("packEntityToSection", "C-g", () => {
      this.project.stageManager.packEntityToSectionBySelected();
    });
    await this.project.keyBinds.create("createUndirectedEdgeFromEntities", "S-g", () => {
      // 构建无向边
      const selectedNodes = this.project.stageManager
        .getSelectedEntities()
        .filter((node) => node instanceof ConnectableEntity);
      if (selectedNodes.length <= 1) {
        this.project.effects.addEffect(new TextRiseEffect("至少选择两个可连接节点"));
        return;
      }
      const multiTargetUndirectedEdge = MultiTargetUndirectedEdge.createFromSomeEntity(selectedNodes);
      this.project.stageManager.addAssociation(multiTargetUndirectedEdge);
    });

    await this.project.keyBinds.create("deleteSelectedStageObjects", isMac ? "backspace" : "delete", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.stageManager.deleteSelectedStageObjects();
    });

    await this.project.keyBinds.create("createTextNodeFromCameraLocation", "insert", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.camera.clearMoveCommander();
      this.project.camera.speed = Vector.getZero();
      this.project.controllerUtils.addTextNodeByLocation(this.project.camera.location, true);
    });
    await this.project.keyBinds.create("createTextNodeFromMouseLocation", "S-insert", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.camera.clearMoveCommander();
      this.project.camera.speed = Vector.getZero();
      this.project.controllerUtils.addTextNodeByLocation(
        this.project.renderer.transformView2World(MouseLocation.vector()),
        true,
      );
    });

    await this.project.keyBinds.create("createTextNodeFromSelectedTop", "A-arrowup", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.controllerUtils.addTextNodeFromCurrentSelectedNode(Direction.Up, true);
    });

    await this.project.keyBinds.create("createTextNodeFromSelectedRight", "A-arrowright", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.controllerUtils.addTextNodeFromCurrentSelectedNode(Direction.Right, true);
    });

    await this.project.keyBinds.create("createTextNodeFromSelectedLeft", "A-arrowleft", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.controllerUtils.addTextNodeFromCurrentSelectedNode(Direction.Left, true);
    });

    await this.project.keyBinds.create("createTextNodeFromSelectedDown", "A-arrowdown", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.controllerUtils.addTextNodeFromCurrentSelectedNode(Direction.Down, true);
    });

    await this.project.keyBinds.create("selectUp", "arrowup", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.selectUp();
    });
    await this.project.keyBinds.create("selectDown", "arrowdown", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.selectDown();
    });
    await this.project.keyBinds.create("selectLeft", "arrowleft", () => {
      this.project.selectChangeEngine.selectLeft();
    });
    await this.project.keyBinds.create("selectRight", "arrowright", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.selectRight();
    });
    await this.project.keyBinds.create("selectAdditionalUp", "S-arrowup", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.selectUp(true);
    });
    await this.project.keyBinds.create("selectAdditionalDown", "S-arrowdown", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.selectDown(true);
    });
    await this.project.keyBinds.create("selectAdditionalLeft", "S-arrowleft", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.selectLeft(true);
    });
    await this.project.keyBinds.create("selectAdditionalRight", "S-arrowright", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.selectRight(true);
    });

    await this.project.keyBinds.create("moveUpSelectedEntities", "C-arowup", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      const entities = this.project.stageManager.getEntities().filter((e) => e.isSelected);
      if (entities.length > 0) {
        const rect = entities[0].collisionBox.getRectangle();
        const newRect = rect.clone();
        newRect.location.y -= 100;
        this.project.effects.addEffect(
          RectangleSlideEffect.verticalSlide(
            rect,
            newRect,
            this.project.stageStyleManager.currentStyle.effects.successShadow,
          ),
        );
      }
      this.project.entityMoveManager.moveSelectedEntities(new Vector(0, -100));
    });

    await this.project.keyBinds.create("moveDownSelectedEntities", "C-arrowdown", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      const entities = this.project.stageManager.getEntities().filter((e) => e.isSelected);
      if (entities.length > 0) {
        const rect = entities[0].collisionBox.getRectangle();
        const newRect = rect.clone();
        newRect.location.y += 100;
        this.project.effects.addEffect(
          RectangleSlideEffect.verticalSlide(
            rect,
            newRect,
            this.project.stageStyleManager.currentStyle.effects.successShadow,
          ),
        );
      }
      this.project.entityMoveManager.moveSelectedEntities(new Vector(0, 100));
    });

    await this.project.keyBinds.create("moveLeftSelectedEntities", "C-arrowleft", () => {
      const entities = this.project.stageManager.getEntities().filter((e) => e.isSelected);
      if (entities.length > 0) {
        const rect = entities[0].collisionBox.getRectangle();
        const newRect = rect.clone();
        newRect.location.x -= 100;
        this.project.effects.addEffect(
          RectangleSlideEffect.horizontalSlide(
            rect,
            newRect,
            this.project.stageStyleManager.currentStyle.effects.successShadow,
          ),
        );
      }
      this.project.entityMoveManager.moveSelectedEntities(new Vector(-100, 0));
    });

    await this.project.keyBinds.create("moveRightSelectedEntities", "C-arrowright", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      const entities = this.project.stageManager.getEntities().filter((e) => e.isSelected);
      if (entities.length > 0) {
        const rect = entities[0].collisionBox.getRectangle();
        const newRect = rect.clone();
        newRect.location.x += 100;
        this.project.effects.addEffect(
          RectangleSlideEffect.horizontalSlide(
            rect,
            newRect,
            this.project.stageStyleManager.currentStyle.effects.successShadow,
          ),
        );
      }
      this.project.entityMoveManager.moveSelectedEntities(new Vector(100, 0));
    });
    await this.project.keyBinds.create("jumpMoveUpSelectedEntities", "C-A-arrowup", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.entityMoveManager.jumpMoveSelectedConnectableEntities(new Vector(0, -100));
    });

    await this.project.keyBinds.create("jumpMoveDownSelectedEntities", "C-A-arrowdown", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.entityMoveManager.jumpMoveSelectedConnectableEntities(new Vector(0, 100));
    });

    await this.project.keyBinds.create("jumpMoveLeftSelectedEntities", "C-A-arrowleft", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.entityMoveManager.jumpMoveSelectedConnectableEntities(new Vector(-100, 0));
    });

    await this.project.keyBinds.create("jumpMoveRightSelectedEntities", "C-A-arrowright", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.entityMoveManager.jumpMoveSelectedConnectableEntities(new Vector(100, 0));
    });

    await this.project.keyBinds.create("editEntityDetails", "C-enter", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.controllerUtils.editNodeDetailsByKeyboard();
    });

    await this.project.keyBinds.create("openColorPanel", "F6", () => {
      ColorWindow.open();
    });
    await this.project.keyBinds.create("switchDebugShow", "F3", () => {
      const currentValue = this.project.renderer.isShowDebug;
      Settings.set("showDebug", !currentValue);
    });

    await this.project.keyBinds.create("selectAll", "C-a", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.stageManager.selectAll();
      this.project.effects.addEffect(ViewOutlineFlashEffect.normal(Color.Green));
    });
    await this.project.keyBinds.create("textNodeToSection", "C-g", () => {
      this.project.sectionPackManager.textNodeToSection();
    });
    await this.project.keyBinds.create("unpackEntityFromSection", "C-g", () => {
      this.project.sectionPackManager.unpackSelectedSections();
    });
    await this.project.keyBinds.create("checkoutProtectPrivacy", "C-2", () => {
      Settings.set("protectingPrivacy", !this.project.renderer.protectingPrivacy);
    });
    await this.project.keyBinds.create("searchText", "C-f", () => {
      FindWindow.open();
    });
    await this.project.keyBinds.create("openTextNodeByContentExternal", "C-e", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      openBrowserOrFile();
    });

    await this.project.keyBinds.create("clickAppMenuSettingsButton", "S-!", () => {
      SettingsWindow.open();
    });
    await this.project.keyBinds.create("clickTagPanelButton", "S-@", () => {
      TagWindow.open();
    });
    await this.project.keyBinds.create("clickAppMenuRecentFileButton", "S-#", () => {
      RecentFilesWindow.open();
    });
    await this.project.keyBinds.create("clickStartFilePanelButton", "S-$", () => {
      const button = document.getElementById("app-start-file-btn");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      button?.dispatchEvent(event);
      setTimeout(() => {
        this.project.controller.pressingKeySet.clear();
      }, 200);
    });
    await this.project.keyBinds.create("saveFile", "C-s", () => {
      onSave();
    });
    await this.project.keyBinds.create("newDraft", "C-n", () => {
      onNewDraft();
    });
    await this.project.keyBinds.create("openFile", "C-o", () => {
      onOpen();
    });

    await this.project.keyBinds.create("checkoutWindowOpacityMode", "C-0", async () => {
      // 切换窗口透明度模式
      const currentValue = await Settings.get("windowBackgroundAlpha");
      if (currentValue === 0) {
        Settings.set("windowBackgroundAlpha", 1);
      } else {
        Settings.set("windowBackgroundAlpha", 0);
      }
    });
    await this.project.keyBinds.create("windowOpacityAlphaIncrease", "C-A-S-+", async () => {
      const currentValue = await Settings.get("windowBackgroundAlpha");
      if (currentValue === 1) {
        // 已经不能再大了
        this.project.effects.addEffect(
          ViewOutlineFlashEffect.short(this.project.stageStyleManager.currentStyle.effects.flash),
        );
      } else {
        Settings.set("windowBackgroundAlpha", Math.min(1, currentValue + 0.2));
      }
    });
    await this.project.keyBinds.create("windowOpacityAlphaDecrease", "C-A-S--", async () => {
      const currentValue = await Settings.get("windowBackgroundAlpha");
      if (currentValue === 0) {
        // 已经不能再小了
        this.project.effects.addEffect(
          ViewOutlineFlashEffect.short(this.project.stageStyleManager.currentStyle.effects.flash),
        );
      } else {
        Settings.set("windowBackgroundAlpha", Math.max(0, currentValue - 0.2));
      }
    });

    await this.project.keyBinds.create("penStrokeWidthIncrease", "=", async () => {
      if (Settings.sync.mouseLeftMode === "draw") {
        const newWidth = this.project.controller.penStrokeDrawing.currentStrokeWidth + 4;
        this.project.controller.penStrokeDrawing.currentStrokeWidth = Math.max(1, Math.min(newWidth, 1000));
        this.project.effects.addEffect(
          TextRiseEffect.default(`${this.project.controller.penStrokeDrawing.currentStrokeWidth}px`),
        );
      }
    });
    await this.project.keyBinds.create("penStrokeWidthDecrease", "-", async () => {
      if (Settings.sync.mouseLeftMode === "draw") {
        const newWidth = this.project.controller.penStrokeDrawing.currentStrokeWidth - 4;
        this.project.controller.penStrokeDrawing.currentStrokeWidth = Math.max(1, Math.min(newWidth, 1000));
        this.project.effects.addEffect(
          TextRiseEffect.default(`${this.project.controller.penStrokeDrawing.currentStrokeWidth}px`),
        );
      }
    });

    await this.project.keyBinds.create("copy", "C-c", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.copyEngine.copy();
    });
    await this.project.keyBinds.create("paste", "C-v", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.copyEngine.paste();
    });

    await this.project.keyBinds.create("pasteWithOriginLocation", "C-v", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.copyEngine.pasteWithOriginLocation();
    });

    await this.project.keyBinds.create("checkoutLeftMouseToSelectAndMove", "v", async () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      Stage.MouseModeManager.checkoutSelectAndMoveHook();
    });
    await this.project.keyBinds.create("checkoutLeftMouseToDrawing", "p", async () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      Stage.MouseModeManager.checkoutDrawingHook();
    });

    // 鼠标左键切换为连接模式
    // let lastMouseMode = "selectAndMove";
    await this.project.keyBinds.create("checkoutLeftMouseToConnectAndCutting", "c", async () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      Stage.MouseModeManager.checkoutConnectAndCuttingHook();
    });

    (
      await this.project.keyBinds.create("checkoutLeftMouseToConnectAndCuttingOnlyPressed", "z", async () => {
        // lastMouseMode = Settings.sync.mouseLeftMode;
        if (!this.project.keyboardOnlyEngine.isOpenning()) return;
        Stage.MouseModeManager.checkoutConnectAndCuttingHook();
      })
    ).up(async () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      Stage.MouseModeManager.checkoutSelectAndMoveHook();
    });

    await this.project.keyBinds.create("selectEntityByPenStroke", "C-w", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      PenStrokeMethods.selectEntityByPenStroke();
    });
    await this.project.keyBinds.create("expandSelectEntity", "C-w", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.expandSelect(false, false);
    });
    await this.project.keyBinds.create("expandSelectEntityReversed", "C-w", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.expandSelect(false, true);
    });
    await this.project.keyBinds.create("expandSelectEntityKeepLastSelected", "C-A-w", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.expandSelect(true, false);
    });
    await this.project.keyBinds.create("expandSelectEntityReversedKeepLastSelected", "C-A-S-w", async () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.selectChangeEngine.expandSelect(true, true);
    });

    await this.project.keyBinds.create("generateNodeTreeWithDeepMode", "tab", async () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.keyboardOnlyTreeEngine.onDeepGenerateNode();
    });

    await this.project.keyBinds.create("masterBrakeControl", "pause", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      // 按下一次就清空动力
      this.project.camera.clearMoveCommander();
      this.project.camera.speed = Vector.getZero();
    });

    await this.project.keyBinds.create("masterBrakeCheckout", "space", async () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      // 看成汽车的手刹，按下一次就切换是否允许移动
      this.project.camera.clearMoveCommander();
      this.project.camera.speed = Vector.getZero();
      Settings.set("allowMoveCameraByWSAD", !(await Settings.get("allowMoveCameraByWSAD")));
    });

    await this.project.keyBinds.create("generateNodeTreeWithBroadMode", "\\", async () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      this.project.keyboardOnlyTreeEngine.onBroadGenerateNode();
    });

    (await this.project.keyBinds.create("generateNodeGraph", "`"))
      .down(() => {
        if (!this.project.keyboardOnlyEngine.isOpenning()) return;
        if (this.project.keyboardOnlyGraphEngine.isEnableVirtualCreate()) {
          this.project.keyboardOnlyGraphEngine.createStart();
        }
      })
      .up(() => {
        if (!this.project.keyboardOnlyEngine.isOpenning()) return;
        if (this.project.keyboardOnlyGraphEngine.isCreating()) {
          this.project.keyboardOnlyGraphEngine.createFinished();
        }
      });
    await this.project.keyBinds.create("treeGraphAdjust", "f", () => {
      if (!this.project.keyboardOnlyEngine.isOpenning()) return;
      const entities = this.project.stageManager
        .getSelectedEntities()
        .filter((entity) => entity instanceof ConnectableEntity);
      for (const entity of entities) {
        this.project.keyboardOnlyTreeEngine.adjustTreeNode(entity);
      }
    });
  }
}
