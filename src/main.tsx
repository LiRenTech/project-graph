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

const router = createMemoryRouter(routes);
const Routes = () => <RouterProvider router={router} />;
// 0.2ms

// 2024/10/5 发现这里Linux 系统下，await不能直接写在最外层，会导致整个页面无法渲染，原因未知

(async () => {
  // 这段代码用时
  await Settings.init();
  await RecentFileManager.init();
  // 15~20ms 左右
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
            RecentFileManager.openFileByPath(path);
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

  // 思考应该把用户自定义路径字符串放在哪个里面

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
