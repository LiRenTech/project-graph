import { routes } from "@generouted/react-router";
import { getMatches } from "@tauri-apps/plugin-cli";
import "driver.js/dist/driver.css";
import i18next from "i18next";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { runCli } from "./cli";
import { Dialog } from "./components/dialog";
import { Popup } from "./components/popup";
import { Color } from "./core/dataStruct/Color";
import { Vector } from "./core/dataStruct/Vector";
import { EdgeRenderer } from "./core/render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "./core/render/canvas2d/renderer";
import { InputElement } from "./core/render/domElement/inputElement";
import {
  addTextNodeByLocation,
  addTextNodeFromCurrentSelectedNode,
  editNodeDetailsByKeyboard,
} from "./core/service/controlService/controller/concrete/utilsControl";
import { KeyBinds } from "./core/service/controlService/KeyBinds";
import { KeyboardOnlyEngine } from "./core/service/controlService/keyboardOnlyEngine/keyboardOnlyEngine";
import { MouseLocation } from "./core/service/controlService/MouseLocation";
import { RecentFileManager } from "./core/service/dataFileService/RecentFileManager";
import { StartFilesManager } from "./core/service/dataFileService/StartFilesManager";
import { ColorManager } from "./core/service/feedbackService/ColorManager";
import { TextRiseEffect } from "./core/service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { ViewOutlineFlashEffect } from "./core/service/feedbackService/effectEngine/concrete/ViewOutlineFlashEffect";
import { SoundService } from "./core/service/feedbackService/SoundService";
import { StageStyleManager } from "./core/service/feedbackService/stageStyle/StageStyleManager";
import { LastLaunch } from "./core/service/LastLaunch";
import { Settings } from "./core/service/Settings";
import { Camera } from "./core/stage/Camera";
import { Stage } from "./core/stage/Stage";
import { StageHistoryManager } from "./core/stage/stageManager/StageHistoryManager";
import { StageManager } from "./core/stage/stageManager/StageManager";
import { EdgeCollisionBoxGetter } from "./core/stage/stageObject/association/EdgeCollisionBoxGetter";
import "./index.css";
import { ColorPanel } from "./pages/_toolbar";
import "./polyfills/roundRect";
import { exists } from "./utils/fs";
import { exit, openDevtools, writeStderr, writeStdout } from "./utils/otherApi";
import { getCurrentWindow, isDesktop, isWeb } from "./utils/platform";
import { Tourials } from "./core/service/Tourials";
import { Direction } from "./types/directions";

const router = createMemoryRouter(routes);
const Routes = () => <RouterProvider router={router} />;
const el = document.getElementById("root")!;

// 建议挂载根节点前的一系列操作统一写成函数，
// 在这里看着清爽一些，像一个列表清单一样。也方便调整顺序

(async () => {
  const matches = !isWeb && isDesktop ? await getMatches() : null;
  const isCliMode = isDesktop && matches?.args.output?.occurrences === 1;
  await Promise.all([
    Settings.init(),
    RecentFileManager.init(),
    LastLaunch.init(),
    StartFilesManager.init(),
    KeyBinds.init(),
    ColorManager.init(),
    Tourials.init(),
  ]);
  // 这些东西依赖上面的东西，所以单独一个Promise.all
  await Promise.all([loadLanguageFiles(), loadSyncModules(), loadStartFile(), registerKeyBinds()]);
  await renderApp(isCliMode);
  if (isCliMode) {
    try {
      await runCli(matches);
      exit();
    } catch (e) {
      writeStderr(String(e));
      exit(1);
    }
  }
})();

/** 加载同步初始化的模块 */
async function loadSyncModules() {
  EdgeCollisionBoxGetter.init();
  EdgeRenderer.init();
  Renderer.init();
  Camera.init();
  Stage.init();
  StageHistoryManager.init();
  StageStyleManager.init();
  MouseLocation.init();
  StageManager.init();
  // 可以稍微晚几秒再初始化都没事的模块
  SoundService.init();
  KeyboardOnlyEngine.init();
  InputElement.init();
}

/**
 * 注册所有快捷键
 */
async function registerKeyBinds() {
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
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageHistoryManager.undo();
  });

  (
    await KeyBinds.create("redo", "y", {
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageHistoryManager.redo();
  });

  (
    await KeyBinds.create("reload", "F5", {
      control: false,
      alt: false,
      shift: false,
    })
  ).down(() => {
    Dialog.show({
      title: "重新加载应用",
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
      control: true,
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
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageManager.sectionSwitchCollapse();
  });

  (
    await KeyBinds.create("reverseEdges", "t", {
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageManager.reverseSelectedEdges();
  });
  (
    await KeyBinds.create("reverseSelectedNodeEdge", "t", {
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageManager.reverseSelectedNodeEdge();
  });

  (
    await KeyBinds.create("packEntityToSection", "g", {
      control: true,
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
    await KeyBinds.create("createTextNodeFromCameraLocation", "p", {
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    addTextNodeByLocation(Camera.location, true);
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
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageManager.moveSelectedNodes(new Vector(0, -100));
  });

  (
    await KeyBinds.create("moveDownSelectedEntities", "arrowdown", {
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageManager.moveSelectedNodes(new Vector(0, 100));
  });

  (
    await KeyBinds.create("moveLeftSelectedEntities", "arrowleft", {
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageManager.moveSelectedNodes(new Vector(-100, 0));
  });

  (
    await KeyBinds.create("moveRightSelectedEntities", "arrowright", {
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageManager.moveSelectedNodes(new Vector(100, 0));
  });

  (
    await KeyBinds.create("editEntityDetails", "enter", {
      control: true,
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
    Popup.show(<ColorPanel />);
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
      control: true,
      alt: false,
      shift: false,
    })
  ).down(() => {
    StageManager.selectAll();
    Stage.effectMachine.addEffect(ViewOutlineFlashEffect.normal(Color.Green));
  });
  (
    await KeyBinds.create("textNodeToSection", "g", {
      control: true,
      alt: false,
      shift: true,
    })
  ).down(() => {
    StageManager.textNodeToSection();
  });

  const bind = await KeyBinds.create("keyboardOnlyGenerateNode", "tab", {
    control: false,
    alt: false,
    shift: false,
  });
  bind.down(() => {
    if (KeyboardOnlyEngine.isEnableVirtualCreate()) {
      KeyboardOnlyEngine.createStart();
    }
  });
  bind.up(() => {
    if (KeyboardOnlyEngine.isCreating()) {
      KeyboardOnlyEngine.createFinished();
    }
  });
  const bindCamear = await KeyBinds.create("masterBrakeControl", "pause", {
    control: false,
    alt: false,
    shift: false,
  });
  // 此按键有待进一步设计
  bindCamear.down(() => {
    // Camera.allowMoveCameraByWSAD = false;
    Camera.clearMoveCommander();
    Camera.speed = Vector.getZero();
  });
  bindCamear.up(() => {
    // Camera.allowMoveCameraByWSAD = true;
  });
}

/** 加载语言文件 */
async function loadLanguageFiles() {
  i18next.use(initReactI18next).init({
    lng: await Settings.get("language"),
    // debug会影响性能，并且没什么用，所以关掉
    // debug: import.meta.env.DEV,
    debug: false,
    defaultNS: "",
    fallbackLng: "zh_CN",
    saveMissing: false,
    resources: {
      en: await import("./locales/en.yml").then((m) => m.default),
      zh_CN: await import("./locales/zh_CN.yml").then((m) => m.default),
      zh_TW: await import("./locales/zh_TW.yml").then((m) => m.default),
    },
  });
}

/** 加载用户自定义的工程文件，或者从启动参数中获取 */
async function loadStartFile() {
  let path = "";
  if (isDesktop && !isWeb) {
    const cliMatches = await getMatches();
    if (cliMatches.args.path.value) {
      path = cliMatches.args.path.value as string;
    } else {
      path = await StartFilesManager.getCurrentStartFile();
    }
  } else {
    path = await StartFilesManager.getCurrentStartFile();
  }
  if (path === "") {
    return;
  }
  const isExists = await exists(path);
  if (isExists) {
    // 打开自定义的工程文件
    RecentFileManager.openFileByPath(path);
    setTimeout(() => {
      // 更改顶部路径名称
      RecentFileManager.openFileByPathWhenAppStart(path);
    }, 1000);
  } else {
    // 自动打开路径不存在
    Stage.effectMachine.addEffect(new TextRiseEffect(`打开工程失败，${path}不存在！`));
  }
}

/** 渲染应用 */
async function renderApp(cli: boolean = false) {
  const root = createRoot(el);
  if (cli) {
    await getCurrentWindow().hide();
    await getCurrentWindow().setSkipTaskbar(true);
    root.render(<></>);
  } else {
    root.render(<Routes />);
  }
}
