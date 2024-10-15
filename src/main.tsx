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
