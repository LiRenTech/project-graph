import { createRoot } from "react-dom/client";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { routes } from "@generouted/react-router";
import "./index.pcss";
import { RecoilRoot } from "recoil";
import { DialogProvider } from "./utils/dialog";
import { Settings } from "./core/Settings";
import { RecentFileManager } from "./core/RecentFileManager";
import { PopupDialogProvider } from "./utils/popupDialog";
import { EdgeRenderer } from "./core/render/canvas2d/entityRenderer/edge/EdgeRenderer";
import { Renderer } from "./core/render/canvas2d/renderer";
import { invoke } from "@tauri-apps/api/core";
import { Stage } from "./core/stage/Stage";
import { TextRiseEffect } from "./core/effect/concrete/TextRiseEffect";
// import { platform } from "@tauri-apps/plugin-os";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { EdgeCollisionBoxGetter } from "./core/stageObject/association/EdgeCollisionBoxGetter";

const router = createMemoryRouter(routes);
const Routes = () => <RouterProvider router={router} />;
// 0.2ms

// 2024/10/5 发现这里Linux 系统下，await不能直接写在最外层，会导致整个页面无法渲染，原因：webkit目前不支持顶层await

(async () => {
  // 这段代码用时
  await Settings.init();
  await RecentFileManager.init();
  // 15~20ms 左右
  EdgeCollisionBoxGetter.init();
  EdgeRenderer.init();
  Renderer.init();

  // 启动时加载用户自定义的工程文件
  Settings.get("autoOpenPath").then((path) => {
    if (path === "") {
      // 还没有设置自动打开路径
      return;
    } else {
      invoke<string>("check_json_exist", {
        path,
      })
        .then((isExists) => {
          console.log(isExists);
          if (isExists) {
            // 打开自定义的工程文件
            RecentFileManager.openFileByPath(path);
            setTimeout(() => {
              RecentFileManager.openFileByPathWhenAppStart(path);
            }, 1000);
            console.log("自动打开了工程文件：" + path);
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
  // 热重载时更新语言包
  // import.meta.hot?.on("vite:afterUpdate", (ev) => {
  //   if (ev.updates.find((u) => u.path.endsWith(".yml"))) {
  //     i18next.reloadResources();
  //   }
  // });

  createRoot(document.getElementById("root")!).render(
    <RecoilRoot>
      <DialogProvider>
        <PopupDialogProvider>
          <Routes />
        </PopupDialogProvider>
      </DialogProvider>
    </RecoilRoot>,
  );
  // 渲染，2ms左右
})();
