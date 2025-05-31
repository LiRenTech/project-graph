import { LogicalSize } from "@tauri-apps/api/dpi";
import { restoreStateCurrent, saveWindowState, StateFlags } from "@tauri-apps/plugin-window-state";
import { useAtom } from "jotai";
import { Copy, Cpu, FlaskConical, Menu, Minus, PanelTop, Square, Tag, TextSearch, X, Zap } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../components/Button";
import { Dialog } from "../components/dialog";
import IconButton from "../components/IconButton";
import { Renderer } from "../core/render/canvas2d/renderer";
import { StageSaveManager } from "../core/service/dataFileService/StageSaveManager";
import { Settings } from "../core/service/Settings";
import { Themes } from "../core/service/Themes";
import { Stage } from "../core/stage/Stage";
import { StageDumper } from "../core/stage/StageDumper";
import { StageManager } from "../core/stage/stageManager/StageManager";
import { fileAtom, isClassroomModeAtom, isWindowCollapsingAtom } from "../state";
import { cn } from "../utils/cn";
import { PathString } from "../utils/pathString";
import { appScale, getCurrentWindow, isDesktop, isFrame, isIpad, isMac, isMobile, isWeb } from "../utils/platform";
import AppMenu from "./_app_menu";
import PGCanvas from "./_canvas";
import ErrorHandler from "./_fixed_panel/_error_handler";
import ExportPNGPanel from "./_fixed_panel/_export_png_panel";
import ExportTreeTextPanel from "./_fixed_panel/_export_text_panel";
import LogicNodePanel from "./_fixed_panel/_logic_node_panel";
import RecentFilesPanel from "./_fixed_panel/_recent_files_panel";
import SearchingContentPanel from "./_fixed_panel/_searching_content_panel";
import StartFilePanel from "./_fixed_panel/_start_file_panel";
import TagPanel from "./_fixed_panel/_tag_panel";
import FloatingOutlet from "./_floating_outlet";
import RenderSubWindows from "./_render_sub_windows";

export default function App() {
  const [maxmized, setMaxmized] = React.useState(false);

  // 面板状态
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isStartFilePanelOpen, setIsStartFilePanelOpen] = React.useState(false);
  const [isTagPanelOpen, setIsTagPanelOpen] = React.useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = React.useState(false);
  const [isLogicNodePanelOpen, setIsLogicNodePanelOpen] = React.useState(false);
  const [ignoreMouse, setIgnoreMouse] = React.useState(false);

  const [file, setFile] = useAtom(fileAtom);
  const [isClassroomMode, setIsClassroomMode] = useAtom(isClassroomModeAtom);
  const filename = React.useMemo(() => PathString.absolute2file(file), [file]);
  const [useNativeTitleBar, setUseNativeTitleBar] = React.useState(false);
  const [isWindowCollapsing, setIsWindowCollapsing] = useAtom(isWindowCollapsingAtom);

  const { t } = useTranslation("app");

  React.useEffect(() => {
    window.addEventListener("keyup", async (event) => {
      // TODO: 自定义快捷键
      // 这两个按键有待添加到自定义快捷键，但他们函数内部用到了useState，还不太清楚怎么改
      // ——littlefean（2024年12月27日）
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsStartFilePanelOpen(false);
      }
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
    Settings.get("useNativeTitleBar").then((useNativeTitleBar) => {
      setUseNativeTitleBar(useNativeTitleBar);
      if (useNativeTitleBar) {
        getCurrentWindow().setDecorations(true);
      }
    });
    Settings.watch("isClassroomMode", (isClassroomMode) => {
      setIsClassroomMode(isClassroomMode);
    });

    const saveInterval = setInterval(() => {
      setIsSaved(StageSaveManager.isSaved());
    });

    /**
     * 关闭窗口时的事件监听
     */
    getCurrentWindow().onCloseRequested(async (e) => {
      e.preventDefault();
      // 保存窗口位置
      await saveWindowState(StateFlags.SIZE | StateFlags.POSITION | StateFlags.MAXIMIZED);
      try {
        if (Stage.path.getFilePath() === Stage.path.draftName) {
          if (StageManager.isEmpty()) {
            // 空草稿，直接关闭
            await getCurrentWindow().destroy();
          } else {
            await Dialog.show({
              title: "真的要关闭吗？",
              content: "您现在的新建草稿没有保存，是否要关闭项目？",
              buttons: [
                {
                  text: "不保存",
                  onClick: async () => {
                    await getCurrentWindow().destroy();
                  },
                },
                {
                  text: "取消",
                },
              ],
            });
          }
        } else {
          // 先检查下是否开启了关闭自动保存
          const isAutoSave = await Settings.get("autoSaveWhenClose");
          if (isAutoSave) {
            // 开启了自动保存，不弹窗
            await StageSaveManager.saveHandle(file, StageDumper.dump());
            getCurrentWindow().destroy();
          } else {
            // 没开启自动保存，逐步确认
            if (StageSaveManager.isSaved()) {
              getCurrentWindow().destroy();
            } else {
              await Dialog.show({
                title: "真的要关闭吗？",
                content: "您现在的没有保存，是否要关闭项目？",
                buttons: [
                  {
                    text: "保存并关闭",
                    onClick: async () => {
                      await StageSaveManager.saveHandle(file, StageDumper.dump());
                      await getCurrentWindow().destroy();
                    },
                  },
                  {
                    text: "取消关闭",
                  },
                  {
                    text: "不保存并关闭",
                    onClick: async () => {
                      await getCurrentWindow().destroy();
                    },
                  },
                ],
              });
            }
          }
        }
      } catch (error) {
        await Dialog.show({
          title: "保存失败",
          code: `${error}`,
          content: "保存失败，请重试",
        });
      }
    });

    document.querySelector("canvas")?.addEventListener("mousedown", () => setIgnoreMouse(true));
    document.querySelector("canvas")?.addEventListener("mouseup", () => setIgnoreMouse(false));
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
    Stage.path.setPathHook = (pathString: string) => {
      setFile(pathString);
    };

    // 恢复窗口位置大小
    restoreStateCurrent(StateFlags.SIZE | StateFlags.POSITION | StateFlags.MAXIMIZED);

    return () => {
      // 经过测试发现，只要是不关闭软件，根本不会执行这里
      // 随意切换软件内部界面不会执行这里
      clearInterval(saveInterval);
    };
  }, []);

  /**
   * 监控路径变化的地方
   */
  React.useEffect(() => {
    if (file === Stage.path.draftName) {
      getCurrentWindow().setTitle(Stage.path.draftName);
      document.title = Stage.path.draftName;
      Stage.path.setPathInEffect(Stage.path.draftName);
    } else {
      getCurrentWindow().setTitle(`${filename} - Project Graph`);
      document.title = `${filename} - Project Graph`;
      Stage.path.setPathInEffect(file);
    }
    // 如果当前是开发模式，标题需要做区分
    if (import.meta.env.DEV) {
      getCurrentWindow().setTitle(`DEV`);
    }
  }, [file]);

  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    if (maxmized) {
      getCurrentWindow().maximize();
    } else {
      getCurrentWindow().unmaximize();
    }
  }, [maxmized]);

  React.useEffect(() => {
    Stage.autoSaveEngine.setAutoSavePaused(isStartFilePanelOpen);
  }, [isStartFilePanelOpen]);

  const getDisplayFileName = () => {
    let result = filename;
    result = PathString.getShortedFileName(result, 30, 0.66);
    if (file === Stage.path.draftName) {
      return isSaved ? result : t("draftUnsaved");
    } else {
      return result + (isSaved ? "" : t("unsaved"));
    }
  };

  /**
   * 首次启动时显示欢迎页面
   */
  // const navigate = useNavigate();
  // React.useEffect(() => {
  //   if (LastLaunch.isFirstLaunch) {
  //     navigate("/welcome");
  //   }
  // }, []);

  return (
    <div
      className={cn("relative h-full w-full")}
      style={{ zoom: appScale }}
      onClick={() => {
        setIsMenuOpen(false);
        setIsStartFilePanelOpen(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {!isFrame && (
        <>
          {/* 叠加层，显示窗口控件 */}
          <div
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-40 flex w-full gap-2 *:pointer-events-auto",
              {
                "*:!pointer-events-none": ignoreMouse,
              },
              {
                "p-4": !isWindowCollapsing,
              },
            )}
          >
            {/* mac的红绿灯，发现如果没有内容会看不见，里面加一个点儿 */}
            {isMac && !useNativeTitleBar && (
              <Button className="right-4 top-4 flex items-center gap-2 active:scale-100">
                <div
                  className="size-3 rounded-full bg-red-500 active:bg-red-800"
                  onClick={() => getCurrentWindow().close()}
                />
                <div
                  className="size-3 rounded-full bg-yellow-500 active:bg-yellow-800"
                  onClick={() => getCurrentWindow().minimize()}
                />
                <div
                  className="size-3 rounded-full bg-green-500 active:bg-green-800"
                  onClick={() =>
                    getCurrentWindow()
                      .isMaximized()
                      .then((isMaximized) => setMaxmized(!isMaximized))
                  }
                />
              </Button>
            )}
            {/* 左上角菜单按钮 */}
            {!isWindowCollapsing && (
              <IconButton
                tooltip="菜单"
                // 检索用，快捷键触发
                id="app-menu-btn"
                className={cn(isClassroomMode && "opacity-0")}
                onClick={(e) => {
                  e.stopPropagation(); // 避免又触发了关闭
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <Menu className={cn(isMenuOpen && "rotate-90")} />
              </IconButton>
            )}

            {!isWindowCollapsing && (
              <IconButton
                id="tagPanelBtn"
                // 不可以去除id，因为有快捷键能够触发这个按钮的点击事件，会查询到id
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTagPanelOpen(!isTagPanelOpen);
                }}
                tooltip="标签节点"
                className={cn(isClassroomMode && "opacity-0")}
              >
                <Tag className={cn("cursor-pointer", isTagPanelOpen ? "rotate-90" : "")} />
              </IconButton>
            )}

            {/* 逻辑节点按钮 */}
            {!isWindowCollapsing && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLogicNodePanelOpen(!isLogicNodePanelOpen);
                }}
                className={cn(isClassroomMode && "opacity-0")}
                tooltip="逻辑节点"
              >
                <Cpu className={cn("cursor-pointer", isLogicNodePanelOpen ? "rotate-45" : "")} />
              </IconButton>
            )}
            {/* 搜索内容按钮 */}
            {!isWindowCollapsing && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchPanelOpen(!isSearchPanelOpen);
                }}
                className={cn(isClassroomMode && "opacity-0")}
                id="app-search-content-btn"
                tooltip="搜索内容"
              >
                <TextSearch className={cn("cursor-pointer", isSearchPanelOpen ? "rotate-45" : "")} />
              </IconButton>
            )}
            {/* 中间标题 */}
            {useNativeTitleBar || isWeb ? (
              // h-0 才能完全摆脱划线时经过此区域的卡顿问题
              <div className="pointer-events-none h-0 flex-1"></div>
            ) : (
              <>
                <Button
                  data-tauri-drag-region
                  className={cn("pointer-events-none relative flex-1 overflow-ellipsis active:scale-100", {
                    "text-panel-error-text": isSaved,
                    "flex-1": isDesktop,
                    "opacity-0": isClassroomMode,
                    "text-xs": isWindowCollapsing,
                  })}
                  tooltip="按住拖动窗口，双击最大化切换"
                >
                  {isMobile && getDisplayFileName()}
                  {isDesktop && (
                    <div
                      data-tauri-drag-region
                      className={cn(
                        isSaved ? "text-button-text" : "text-panel-error-text",
                        "absolute flex h-full w-full items-center justify-center truncate p-0 hover:cursor-move active:cursor-grabbing",
                        isClassroomMode && "opacity-0",
                      )}
                    >
                      {getDisplayFileName()}
                    </div>
                  )}
                </Button>
                {isMobile && <div className="flex-1"></div>}
              </>
            )}
            {/* 右上角闪电按钮 */}
            {!isWindowCollapsing && !isWeb && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStartFilePanelOpen(!isStartFilePanelOpen);
                }}
                id="app-start-file-btn"
                className={cn(isClassroomMode && "opacity-0")}
                tooltip="设置启动时打开的文件"
                disabled={isMobile}
              >
                <Zap className={cn("cursor-pointer", isStartFilePanelOpen ? "rotate-45 scale-125" : "")} />
              </IconButton>
            )}
            {isDesktop && !isIpad && (
              <IconButton
                className={cn(
                  isWindowCollapsing && "h-2 w-2 border-green-300 bg-green-500",
                  isClassroomMode && "opacity-0",
                )}
                onClick={async (e) => {
                  e.stopPropagation();
                  // const size = await getCurrentWindow().outerSize();
                  const tauriWindow = getCurrentWindow();
                  if (isWindowCollapsing) {
                    // 展开
                    tauriWindow.setSize(new LogicalSize(1100, 800));
                    tauriWindow.setAlwaysOnTop(false);
                  } else {
                    // 收起
                    const width = await Settings.get("windowCollapsingWidth");
                    const height = await Settings.get("windowCollapsingHeight");

                    await tauriWindow.setSize(new LogicalSize(width, height));
                    // await tauriWindow.setPosition(new LogicalPosition(50, 50));
                    await tauriWindow.setAlwaysOnTop(true);
                  }
                  setIsWindowCollapsing(!isWindowCollapsing);
                }}
                tooltip={isWindowCollapsing ? "展开并取消顶置窗口" : "进入迷你窗口模式"}
              >
                <PanelTop className={cn("cursor-pointer", isWindowCollapsing ? "rotate-180 scale-125" : "")} />
              </IconButton>
            )}
            {/* ipad测试按钮 */}
            {isIpad && (
              <IconButton
                onClick={() => {
                  Renderer.resizeWindow(window.innerWidth, window.innerHeight);

                  let printData = `Renderer w,h: ${Renderer.w}, ${Renderer.h}\n`;
                  printData += `window inner: ${window.innerWidth}, ${window.innerHeight}`;
                  printData += `window: ${window.outerWidth}, ${window.outerHeight}`;
                  Dialog.show({
                    title: "ipad 测试",
                    content: printData,
                  });
                }}
              >
                <FlaskConical />
              </IconButton>
            )}

            {/* 右上角窗口控制按钮 */}
            {isDesktop && !isWindowCollapsing && !useNativeTitleBar && !isMac && !isWeb && (
              <Button
                className={cn("right-4 top-4 flex items-center gap-1 active:scale-100", isClassroomMode && "opacity-0")}
              >
                {/* 最小化 */}
                <Minus
                  onClick={() => getCurrentWindow().minimize()}
                  className="transition hover:opacity-80 active:scale-75"
                />
                {/* 最大化/取消窗口最大化 */}
                {maxmized ? (
                  <Copy
                    onClick={() => setMaxmized(false)}
                    size={16}
                    strokeWidth={3}
                    className="transition hover:opacity-80 active:scale-75"
                  />
                ) : (
                  <Square
                    onClick={() => setMaxmized(true)}
                    className="scale-75 transition hover:opacity-80 active:scale-75"
                  />
                )}
                {/* 退出 */}
                <X onClick={() => getCurrentWindow().close()} className="transition hover:opacity-80 active:scale-75" />
              </Button>
            )}
          </div>
          {/* @鹿松狸，鼠标移动到最右上角出现关闭窗口按钮 */}
          {!isMac && !isWindowCollapsing && !useNativeTitleBar && (
            <div
              className="fixed right-0 top-0 z-50 size-1 cursor-pointer rounded-bl-2xl bg-amber-200 transition-all hover:size-14 hover:bg-red-500"
              onClick={() => {
                getCurrentWindow().close();
              }}
            >
              <X className="cursor-pointer" />
            </div>
          )}

          {/* 面板列表 */}
          <AppMenu className="absolute left-4 top-16 z-20" open={isMenuOpen} />
          <TagPanel open={isTagPanelOpen} className="z-10" />
          <SearchingContentPanel open={isSearchPanelOpen} className="z-10" />
          <LogicNodePanel open={isLogicNodePanelOpen} className="z-10" />
          <StartFilePanel open={isStartFilePanelOpen} />
          <RecentFilesPanel />
          <ExportTreeTextPanel />
          <ExportPNGPanel />
        </>
      )}
      {/* ======= */}
      <ErrorHandler />

      <PGCanvas />

      <FloatingOutlet />
      <RenderSubWindows />
    </div>
  );
}

export function Catch() {
  return <></>;
}
