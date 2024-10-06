import { createRoot } from "react-dom/client";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { routes } from "@generouted/react-router";
import "./index.pcss";
import { RecoilRoot } from "recoil";
import { DialogProvider } from "./utils/dialog";
import { Settings } from "./core/Settings";
import { RecentFileManager } from "./core/RecentFileManager";
// import { platform } from "@tauri-apps/plugin-os";

console.log("Hello, world!");

const router = createMemoryRouter(routes);
const Routes = () => <RouterProvider router={router} />;

// const currentPlatform = await platform();
// console.log(currentPlatform);

// if (currentPlatform === "windows") {
//   await Settings.init();
//   await RecentFileManager.init();
// } else {
//   // 2024/10/5 发现这里Linux 系统下，await会导致整个页面无法渲染，原因未知
//   // Linux
//   // Android, iOS 也可能是这样的
//   Settings.init();
//   RecentFileManager.init();
// }

// Settings.init().then(() => {
//   RecentFileManager.init().then(() => {
//     createRoot(document.getElementById("root")!).render(
//       <RecoilRoot>
//         <DialogProvider>
//           <Routes />
//         </DialogProvider>
//       </RecoilRoot>,
//     );
//   });
// });

(async () => {
  await Settings.init();
  await RecentFileManager.init();
  createRoot(document.getElementById("root")!).render(
    <RecoilRoot>
      <DialogProvider>
        <Routes />
      </DialogProvider>
    </RecoilRoot>,
  );
})();
