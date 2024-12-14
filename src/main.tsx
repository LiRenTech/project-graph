import { routes } from "@generouted/react-router";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import i18next from "i18next";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { PromptManager } from "./core/ai/PromptManager";
import { TextRiseEffect } from "./core/effect/concrete/TextRiseEffect";
import { LastLaunch } from "./core/LastLaunch";
import { RecentFileManager } from "./core/RecentFileManager";
import { EdgeRenderer } from "./core/render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "./core/render/canvas2d/renderer";
import { Settings } from "./core/Settings";
import { SoundService } from "./core/SoundService";
import { Camera } from "./core/stage/Camera";
import { Stage } from "./core/stage/Stage";
import { StageHistoryManager } from "./core/stage/stageManager/StageHistoryManager";
import { EdgeCollisionBoxGetter } from "./core/stageObject/association/EdgeCollisionBoxGetter";
import { StageStyleManager } from "./core/stageStyle/StageStyleManager";
import { StartFilesManager } from "./core/StartFilesManager";
import "./index.pcss";
import { DialogProvider } from "./utils/dialog";
import { PopupDialogProvider } from "./utils/popupDialog";

const router = createHashRouter(routes);
const Routes = () => <RouterProvider router={router} />;
const el = document.getElementById("root")!;

// 建议挂载根节点前的一系列操作统一写成函数，
// 在这里看着清爽一些，像一个列表清单一样。也方便调整顺序

(async () => {
  try {
    const t1 = performance.now();
    await Promise.all([
      Settings.init(),
      RecentFileManager.init(),
      LastLaunch.init(),
      StartFilesManager.init(),
      PromptManager.init(),
    ]);
    // 这些东西依赖上面的东西，所以单独一个Promise.all
    await Promise.all([
      loadLanguageFiles(),
      loadSyncModules(),
      loadStartFile(),
    ]);
    await renderApp();
    console.log(`应用初始化耗时：${performance.now() - t1}ms`);
  } catch (e) {
    console.error(e);
    await getCurrentWindow().setDecorations(true);
    await invoke("devtools");
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
    document.body.style.userSelect = "auto";
    document.body.innerHTML = `应用初始化失败，请截图此窗口，然后加入QQ群1006956704反馈或在GitHub上提交issue(https://github.com/LiRenTech/project-graph/issues) ${String(e)}`;
    return;
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
  SoundService.init();
}

/** 加载语言文件 */
async function loadLanguageFiles() {
  i18next.use(initReactI18next).init({
    lng: await Settings.get("language"),
    debug: import.meta.env.DEV,
    defaultNS: "",
    fallbackLng: "zh-CN",
    resources: {
      en: await import("./locales/en.yml").then((m) => m.default),
      "zh-CN": await import("./locales/zh-CN.yml").then((m) => m.default),
      "zh-TW": await import("./locales/zh-TW.yml").then((m) => m.default),
    },
  });
}

/** 加载用户自定义的工程文件 */
async function loadStartFile() {
  const path = await StartFilesManager.getCurrentStartFile();
  if (path === "") {
    return;
  }
  const isExists = await invoke<string>("check_json_exist", {
    path,
  });
  if (isExists) {
    // 打开自定义的工程文件
    RecentFileManager.openFileByPath(path);
    setTimeout(() => {
      // 更改顶部路径名称
      RecentFileManager.openFileByPathWhenAppStart(path);
    }, 1000);
  } else {
    // 自动打开路径不存在
    Stage.effects.push(new TextRiseEffect(`打开工程失败，${path}不存在！`));
  }
}

/** 渲染应用 */
async function renderApp() {
  createRoot(el).render(
    <DialogProvider>
      <PopupDialogProvider>
        <Routes />
      </PopupDialogProvider>
    </DialogProvider>,
  );
}
