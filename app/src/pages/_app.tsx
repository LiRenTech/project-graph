import { restoreStateCurrent, saveWindowState, StateFlags } from "@tauri-apps/plugin-window-state";
import { useAtom } from "jotai";
import { Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import icon from "../assets/icon.png";
import { Dialog } from "../components/dialog";
import { Settings } from "../core/service/Settings";
import { Themes } from "../core/service/Themes";
import { projectsAtom } from "../state";
import { cn } from "../utils/cn";
import { appScale, getCurrentWindow } from "../utils/platform";

export default function App() {
  const [maxmized, setMaxmized] = useState(false);

  // 面板状态
  // TODO: start file window

  const [projects, setProjects] = useAtom(projectsAtom);
  const [isWindowCollapsing, setIsWindowCollapsing] = useState(false);
  const [isClassroomMode, setIsClassroomMode] = Settings.use("isClassroomMode");

  const { t } = useTranslation("app");

  useEffect(() => {
    window.addEventListener("keyup", async (event) => {
      // TODO: 自定义快捷键
      // 这两个按键有待添加到自定义快捷键，但他们函数内部用到了useState，还不太清楚怎么改
      // ——littlefean（2024年12月27日）
      if (event.key === "F11") {
        // 如果当前已经是最大化的状态
        if (await getCurrentWindow().isMaximized()) {
          setMaxmized(false);
        }
        getCurrentWindow()
          .isFullscreen()
          .then((isFullscreen) => {
            getCurrentWindow().setFullscreen(!isFullscreen);
          });
      }
    });

    // 修复鼠标拖出窗口后触发上下文菜单的问题
    window.addEventListener("contextmenu", (event) => {
      if (
        event.clientX < 0 ||
        event.clientX > window.innerWidth ||
        event.clientY < 0 ||
        event.clientY > window.innerHeight
      )
        event.preventDefault();
    });

    /**
     * 关闭窗口时的事件监听
     */
    getCurrentWindow().onCloseRequested(async (e) => {
      e.preventDefault();
      // 保存窗口位置
      await saveWindowState(StateFlags.SIZE | StateFlags.POSITION | StateFlags.MAXIMIZED);
      await Dialog.show({
        title: "是否保存更改？",
        buttons: [
          {
            text: "保存",
          },
          {
            text: "暂存",
          },
          {
            text: "放弃更改",
          },
          {
            text: "帮助",
            onClick: async () => {
              await Dialog.show({
                title: "暂存是什么东西？",
                content:
                  "在 2.0 以后的版本中，应用会定时将文件内容暂存到缓存目录中，防止应用意外关闭造成的文件丢失。您可以在“最近打开”中找回暂存的文件。",
              });
            },
          },
        ],
      });
    });

    // 监听主题样式切换
    Settings.watch("theme", (value) => {
      let styleEl = document.querySelector("#pg-theme");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "pg-theme";
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `
        :root {
          ${Themes.convertThemeToCSS(Themes.getThemeById(value)?.content)}
        }
      `;
    });

    // 恢复窗口位置大小
    restoreStateCurrent(StateFlags.SIZE | StateFlags.POSITION | StateFlags.MAXIMIZED);
  }, []);

  useEffect(() => {
    if (maxmized) {
      getCurrentWindow().maximize();
    } else {
      getCurrentWindow().unmaximize();
    }
  }, [maxmized]);

  /**
   * 首次启动时显示欢迎页面
   */
  // const navigate = useNavigate();
  // useEffect(() => {
  //   if (LastLaunch.isFirstLaunch) {
  //     navigate("/welcome");
  //   }
  // }, []);

  // FIXME: remove bg-black
  return (
    <div
      className={cn("relative flex h-full w-full flex-col gap-2 bg-black p-2")}
      style={{ zoom: appScale }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 第一行：logo | 菜单 | ...移动窗口区域... | 窗口控制按钮 */}
      <div className="bg-titlebar-bg text-titlebar-text border-titlebar-border flex h-8 items-center overflow-hidden rounded-lg border">
        <img src={icon} alt="logo" className="m-2 size-6" />
        <div className="m-2 flex items-center gap-2 text-sm">
          <span>文件</span>
          <span>编辑</span>
          <span>视图</span>
          <span>帮助</span>
        </div>
        <div className="flex-1" data-tauri-drag-region></div>
        <div className="*:hover:bg-titlebar-control-hover-bg flex h-full *:flex *:h-full *:w-8 *:items-center *:justify-center">
          <div>
            <Minus size={14} />
          </div>
          <div>
            <Square size={10} strokeWidth={3} />
          </div>
          <div>
            <X size={14} />
          </div>
        </div>
      </div>

      {/* 第二行：标签页 */}
      <div className="flex h-8 gap-2 overflow-x-auto">
        {Array.from({ length: 30 }, (_, i) => `文件${i + 1}`).map((file) => (
          <div
            key={file}
            className="bg-titlebar-bg text-titlebar-text border-titlebar-border flex shrink-0 items-center gap-1 rounded-lg border p-2"
          >
            <span className="text-sm">{file}</span>
            <X size={16} strokeWidth={3} className="hover:bg-titlebar-control-hover-bg rounded-full hover:scale-125" />
          </div>
        ))}
      </div>

      {/* ======= */}
      {/* <ErrorHandler /> */}

      {/* <PGCanvas /> */}

      {/* <FloatingOutlet />
      <RenderSubWindows /> */}
    </div>
  );
}

export function Catch() {
  return <></>;
}
