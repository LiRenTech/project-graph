import { routes } from "@generouted/react-router";
// import { Menu, MenuItem } from "@tauri-apps/api/menu";
import { getMatches } from "@tauri-apps/plugin-cli";
import "driver.js/dist/driver.css";
import i18next from "i18next";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { runCli } from "./cli";
import { Dialog } from "./components/dialog";
import { UserScriptsManager } from "./core/plugin/UserScriptsManager";
import { EdgeRenderer } from "./core/render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "./core/render/canvas2d/renderer";
import { InputElement } from "./core/render/domElement/inputElement";
import { KeyboardOnlyEngine } from "./core/service/controlService/keyboardOnlyEngine/keyboardOnlyEngine";
import { MouseLocation } from "./core/service/controlService/MouseLocation";
import { KeyBinds } from "./core/service/controlService/shortcutKeysEngine/KeyBinds";
import { ShortcutKeysRegister } from "./core/service/controlService/shortcutKeysEngine/shortcutKeysRegister";
import { FileLoader } from "./core/service/dataFileService/fileLoader";
import { RecentFileManager } from "./core/service/dataFileService/RecentFileManager";
import { StartFilesManager } from "./core/service/dataFileService/StartFilesManager";
import { ColorManager } from "./core/service/feedbackService/ColorManager";
import { TextRiseEffect } from "./core/service/feedbackService/effectEngine/concrete/TextRiseEffect";
import { SoundService } from "./core/service/feedbackService/SoundService";
import { StageStyleManager } from "./core/service/feedbackService/stageStyle/StageStyleManager";
import { LastLaunch } from "./core/service/LastLaunch";
import { Settings } from "./core/service/Settings";
import { Tourials } from "./core/service/Tourials";
import { UserState } from "./core/service/UserState";
import { Camera } from "./core/stage/Camera";
import { Stage } from "./core/stage/Stage";
import { StageLoader } from "./core/stage/StageLoader";
import { StageHistoryManager } from "./core/stage/stageManager/StageHistoryManager";
import { StageManager } from "./core/stage/stageManager/StageManager";
import { EdgeCollisionBoxGetter } from "./core/stage/stageObject/association/EdgeCollisionBoxGetter";
import "./index.css";
import "./polyfills/roundRect";
import { exists } from "./utils/fs";
import { exit, writeStderr } from "./utils/otherApi";
import { getCurrentWindow, isDesktop, isFrame, isWeb, isWindows } from "./utils/platform";

/**
 * @private
 * 仅供不在组件里的页面跳转使用，在组件里面必须用useNavigate()
 * @example
 * router.navigate("/")
 */
export const router = createMemoryRouter(routes);
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
    UserScriptsManager.init(),
    UserState.init(),
  ]);
  // 这些东西依赖上面的东西，所以单独一个Promise.all
  await Promise.all([loadLanguageFiles(), loadSyncModules(), loadStartFile(), ShortcutKeysRegister.registerKeyBinds()]);
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
  if (isFrame) {
    const fileBase64 = new URLSearchParams(window.location.search).get("file");
    if (!fileBase64) {
      return;
    }
    const file = new TextDecoder().decode(Uint8Array.from(atob(fileBase64), (m) => m.codePointAt(0)!));
    FileLoader.loadStageByData(StageLoader.validate(JSON.parse(file)), "/frame.json");
    Camera.reset();
    return;
  }
  if (isDesktop && !isWeb) {
    const cliMatches = await getMatches();
    if (cliMatches.args.path.value) {
      // ？
      path = cliMatches.args.path.value as string;
      if (isWindows) {
        path = "【不要把json文件的打开方式设置成此软件，应在软件内打开】";
        setTimeout(() => {
          Dialog.show({
            title: "提示",
            content: "不要把json文件的打开方式设置成此软件，应在软件内打开，具体原因详见：",
            code: "https://project-graph.top/docs/app/announcement",
            type: "warning",
          });
        }, 3000);
      }
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
    FileLoader.openFileByPath(path);
    setTimeout(() => {
      // 更改顶部路径名称
      RecentFileManager.openFileByPathWhenAppStart(path);
    }, 1000);
  } else {
    // 自动打开路径不存在
    Stage.effectMachine.addEffect(new TextRiseEffect(`打开工程失败，${path}不存在！`));
  }
}

/** macos加载顶部菜单栏 */
// tnnd, 屏蔽一些mac的顶部菜单栏本来是打算防止有人误以为软件是英文的
// 结果导致节点进入编辑状态后无法command c/v了。

// async function macosLoadMenu() {
//   // 奇怪了，什么都显示不出来（
//   // 创建菜单项
//   const testItem1 = await MenuItem.new({
//     text: "测试",
//     action: (_id) => {
//       console.log(_id);
//     },
//   });
//   const testItem2 = await MenuItem.new({
//     text: "测试2",
//     action: (_id) => {
//       console.log(_id);
//     },
//   });
//   // 创建主菜单
//   const menu = await Menu.new({ items: [testItem1, testItem2] });

//   // 设置应用菜单
//   await menu.setAsAppMenu();
//   console.log("macos加载菜单栏成功");
// }

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
