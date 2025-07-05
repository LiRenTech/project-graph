import { routes } from "@generouted/react-router";
// import { Menu, MenuItem } from "@tauri-apps/api/menu";
import { getMatches } from "@tauri-apps/plugin-cli";
import "driver.js/dist/driver.css";
import i18next from "i18next";
import { Provider } from "jotai";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { runCli } from "./cli";
import { UserScriptsManager } from "./core/plugin/UserScriptsManager";
import { MouseLocation } from "./core/service/controlService/MouseLocation";
import { RecentFileManager } from "./core/service/dataFileService/RecentFileManager";
import { StartFilesManager } from "./core/service/dataFileService/StartFilesManager";
import { ColorManager } from "./core/service/feedbackService/ColorManager";
import { SoundService } from "./core/service/feedbackService/SoundService";
import { Settings } from "./core/service/Settings";
import { Tourials } from "./core/service/Tourials";
import { UserState } from "./core/service/UserState";
import { EdgeCollisionBoxGetter } from "./core/stage/stageObject/association/EdgeCollisionBoxGetter";
import "./index.css";
import "./polyfills/roundRect";
import { store } from "./state";
import { exit, writeStderr } from "./utils/otherApi";
import { getCurrentWindow, isDesktop, isWeb } from "./utils/platform";

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
    StartFilesManager.init(),
    ColorManager.init(),
    Tourials.init(),
    UserScriptsManager.init(),
    UserState.init(),
  ]);
  // 这些东西依赖上面的东西，所以单独一个Promise.all
  await Promise.all([loadLanguageFiles(), loadSyncModules()]);
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
  SoundService.init();
  MouseLocation.init();
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

/** 渲染应用 */
async function renderApp(cli: boolean = false) {
  const root = createRoot(el);
  if (cli) {
    await getCurrentWindow().hide();
    await getCurrentWindow().setSkipTaskbar(true);
    root.render(<></>);
  } else {
    root.render(
      <Provider store={store}>
        <Routes />
      </Provider>,
    );
  }
}
