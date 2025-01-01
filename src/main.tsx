import { routes } from "@generouted/react-router";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getMatches } from "@tauri-apps/plugin-cli";
import i18next from "i18next";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { PromptManager } from "./core/ai/PromptManager";
import { TextRiseEffect } from "./core/effect/concrete/TextRiseEffect";
import { KeyBinds } from "./core/KeyBinds";
import { LastLaunch } from "./core/LastLaunch";
import { MouseLocation } from "./core/MouseLocation";
import { RecentFileManager } from "./core/RecentFileManager";
import { EdgeRenderer } from "./core/render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "./core/render/canvas2d/renderer";
import { Settings } from "./core/Settings";
import { SoundService } from "./core/SoundService";
import { Camera } from "./core/stage/Camera";
import { Stage } from "./core/stage/Stage";
import { StageHistoryManager } from "./core/stage/stageManager/StageHistoryManager";
import { StageManager } from "./core/stage/stageManager/StageManager";
import { EdgeCollisionBoxGetter } from "./core/stageObject/association/EdgeCollisionBoxGetter";
import { StageStyleManager } from "./core/stageStyle/StageStyleManager";
import { StartFilesManager } from "./core/StartFilesManager";
import "./index.pcss";
import "./polyfills/roundRect";
import { Dialog } from "./utils/dialog";
import { exists } from "./utils/fs";

const router = createMemoryRouter(routes);
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
      KeyBinds.init(),
    ]);
    // 这些东西依赖上面的东西，所以单独一个Promise.all
    await Promise.all([
      loadLanguageFiles(),
      loadSyncModules(),
      loadStartFile(),
    ]);
    await renderApp();
    console.log(`应用初始化耗时：${performance.now() - t1}ms`);
    // 开始注册快捷键
    loadKeyBinds();
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
  MouseLocation.init();
  StageManager.init();
}

/**
 * 注册所有快捷键
 */
function loadKeyBinds() {
  // 开始注册快捷键
  KeyBinds.create("test", "t", {
    control: true,
    alt: true,
    shift: true,
  }).then((bind) =>
    bind.down(() =>
      Dialog.show({
        title: "自定义快捷键测试",
        content:
          "您按下了自定义的测试快捷键，这一功能是测试开发所用，可在设置中更改触发方式",
      }),
    ),
  );
  KeyBinds.create("undo", "z", {
    control: true,
    alt: false,
    shift: false,
  }).then((bind) =>
    bind.down(() => {
      StageHistoryManager.undo();
    }),
  );
  KeyBinds.create("redo", "y", {
    control: true,
    alt: false,
    shift: false,
  }).then((bind) =>
    bind.down(() => {
      StageHistoryManager.redo();
    }),
  );
  KeyBinds.create("reload", "F5", {
    control: false,
    alt: false,
    shift: false,
  }).then((bind) =>
    bind.down(() => {
      window.location.reload();
    }),
  );

  // TODO: 下面的F快捷键 不确定id的格式是否是小驼峰，待确认
  // littlefean 2024年12月27日
  // ——issue #87
  // littlefean 2025年1月1日 暂时就先小驼峰吧

  KeyBinds.create("resetView", "F", {
    control: false,
    alt: false,
    shift: false,
  }).then((bind) =>
    bind.down(() => {
      Camera.resetBySelected();
    }),
  );

  KeyBinds.create("resetCameraScale", "r", {
    control: true,
    alt: true,
    shift: false,
  }).then((bind) =>
    bind.down(() => {
      Camera.resetScale();
    }),
  );
}

/** 加载语言文件 */
async function loadLanguageFiles() {
  i18next.use(initReactI18next).init({
    lng: await Settings.get("language"),
    // debug会影响性能，并且没什么用，所以关掉
    // debug: import.meta.env.DEV,
    debug: false,
    defaultNS: "",
    fallbackLng: "zh-CN",
    saveMissing: false,
    resources: {
      en: await import("./locales/en.yml").then((m) => m.default),
      "zh-CN": await import("./locales/zh-CN.yml").then((m) => m.default),
      "zh-TW": await import("./locales/zh-TW.yml").then((m) => m.default),
    },
  });
}

/** 加载用户自定义的工程文件，或者从启动参数中获取 */
async function loadStartFile() {
  const cliMatches = await getMatches();
  let path = "";
  if (cliMatches.args.path.value) {
    path = cliMatches.args.path.value as string;
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
    Stage.effects.push(new TextRiseEffect(`打开工程失败，${path}不存在！`));
  }
}

/** 渲染应用 */
async function renderApp() {
  createRoot(el).render(<Routes />);
}
