import { routes } from "@generouted/react-router";
import { invoke } from "@tauri-apps/api/core";
import i18next from "i18next";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { TextRiseEffect } from "./core/effect/concrete/TextRiseEffect";
import { LastLaunch } from "./core/LastLaunch";
import { RecentFileManager } from "./core/RecentFileManager";
import { EdgeRenderer } from "./core/render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "./core/render/canvas2d/renderer";
import { Settings } from "./core/Settings";
import { Camera } from "./core/stage/Camera";
import { Stage } from "./core/stage/Stage";
import { StageHistoryManager } from "./core/stage/stageManager/StageHistoryManager";
import { EdgeCollisionBoxGetter } from "./core/stageObject/association/EdgeCollisionBoxGetter";
import { StageStyleManager } from "./core/stageStyle/StageStyleManager";
import { StartFilesManager } from "./core/StartFilesManager";
import "./index.pcss";
import { DialogProvider } from "./utils/dialog";
import { PopupDialogProvider } from "./utils/popupDialog";
import { PromptManager } from "./core/ai/PromptManager";

const router = createMemoryRouter(routes);
const Routes = () => <RouterProvider router={router} />;
const el = document.getElementById("root")!;

(async () => {
  // 加载语言文件
  i18next.use(initReactI18next).init({
    lng: "zh-CN",
    debug: import.meta.env.DEV,
    defaultNS: "",
    resources: {
      en: await import("./locales/en.yml").then((m) => m.default),
      "zh-CN": await import("./locales/zh-CN.yml").then((m) => m.default),
      "zh-TW": await import("./locales/zh-TW.yml").then((m) => m.default),
    },
  });

  // 初始化应用
  await Settings.init();
  await RecentFileManager.init();
  await LastLaunch.init();
  await StartFilesManager.init();
  await PromptManager.init();
  // 15~20ms 左右
  EdgeCollisionBoxGetter.init();
  EdgeRenderer.init();
  Renderer.init();
  Camera.init();
  Stage.init();
  StageHistoryManager.init();
  StageStyleManager.init();

  // 加载用户自定义的工程文件
  StartFilesManager.getCurrentStartFile().then((path) => {
    if (path === "") {
      return;
    } else {
      invoke<string>("check_json_exist", {
        path,
      })
        .then((isExists) => {
          if (isExists) {
            // 打开自定义的工程文件
            RecentFileManager.openFileByPath(path);
            setTimeout(() => {
              // 更改顶部路径名称
              RecentFileManager.openFileByPathWhenAppStart(path);
            }, 1000);
          } else {
            // 自动打开路径不存在
            Stage.effects.push(
              new TextRiseEffect(`打开工程失败，${path}不存在！`),
            );
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
  });

  // 启动应用
  createRoot(el).render(
    <RecoilRoot>
      <DialogProvider>
        <PopupDialogProvider>
          <Routes />
        </PopupDialogProvider>
      </DialogProvider>
    </RecoilRoot>,
  );
})();
