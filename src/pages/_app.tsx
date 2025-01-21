import { useAtom } from "jotai";
import {
  BrainCircuit,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Diamond,
  Menu,
  RectangleEllipsis,
  Tag,
  X,
  Zap,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import { Settings } from "../core/service/Settings";
import { Stage } from "../core/stage/Stage";
import { StageDumper } from "../core/stage/StageDumper";
import { StageSaveManager } from "../core/stage/StageSaveManager";
import { fileAtom } from "../state";
import { cn } from "../utils/cn";
import { Dialog } from "../utils/dialog";
import { PathString } from "../utils/pathString";
import {
  appScale,
  getCurrentWindow,
  isDesktop,
  isMac,
  isMobile,
  isWeb,
} from "../utils/platform";
import AiPanel from "./_ai_panel";
import AppMenu from "./_app_menu";
import ErrorHandler from "./_error_handler";
import ExportTreeTextPanel from "./_export_text_panel";
import RecentFilesPanel from "./_recent_files_panel";
import StartFilePanel from "./_start_file_panel";
import TagPanel from "./_tag_panel";

export default function App() {
  const [maxmized, setMaxmized] = React.useState(false);

  // 面板状态
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isStartFilePanelOpen, setIsStartFilePanelOpen] = React.useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = React.useState(false);
  const [isTagPanelOpen, setIsTagPanelOpen] = React.useState(false);
  const [ignoreMouse, setIgnoreMouse] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [file] = useAtom(fileAtom);
  const filename = React.useMemo(() => PathString.absolute2file(file), [file]);
  const [useNativeTitleBar, setUseNativeTitleBar] = React.useState(false);
  const { t } = useTranslation("app");

  React.useEffect(() => {
    getCurrentWindow().onResized(() => {
      getCurrentWindow()
        .isMaximized()
        .then((isMaximized) => {
          setMaxmized(isMaximized);
        });
    });

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
    Settings.get("useNativeTitleBar").then((useNativeTitleBar) => {
      setUseNativeTitleBar(useNativeTitleBar);
      if (useNativeTitleBar) {
        getCurrentWindow().setDecorations(true);
      }
    });

    const saveInterval = setInterval(() => {
      setIsSaved(StageSaveManager.isSaved());
    });

    /**
     * 关闭窗口时的事件监听
     */
    getCurrentWindow().onCloseRequested(async (e) => {
      e.preventDefault();
      try {
        if (Stage.Path.getFilePath() === Stage.Path.draftName) {
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
                      await StageSaveManager.saveHandle(
                        file,
                        StageDumper.dump(),
                      );
                      await getCurrentWindow().destroy();
                    },
                  },
                  {
                    text: "取消关闭",
                  },
                ],
              });
            }
          }
        }
      } catch {
        await Dialog.show({
          title: "保存失败",
          content: "保存失败，请重试",
        });
      }
    });

    document
      .querySelector("canvas")
      ?.addEventListener("mousedown", () => setIgnoreMouse(true));
    document
      .querySelector("canvas")
      ?.addEventListener("mouseup", () => setIgnoreMouse(false));

    return () => {
      clearInterval(saveInterval);
    };
  }, []);

  /**
   * 监控路径变化的地方
   */
  React.useEffect(() => {
    if (file === Stage.Path.draftName) {
      getCurrentWindow().setTitle(Stage.Path.draftName);
      document.title = Stage.Path.draftName;
      Stage.Path.setPathInEffect(Stage.Path.draftName);
    } else {
      getCurrentWindow().setTitle(`${filename} - Project Graph`);
      document.title = `${filename} - Project Graph`;
      Stage.Path.setPathInEffect(file);
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
    Stage.isAutoSavePaused = isStartFilePanelOpen;
  }, [isStartFilePanelOpen]);

  React.useEffect(() => {
    Stage.isAutoSavePaused = isAiPanelOpen;
  }, [isAiPanelOpen]);

  return (
    <div
      className={cn(
        "relative h-full w-full rounded-xl text-white shadow-2xl ring",
        {
          "bg-neutral-950": isMobile || location.pathname !== "/",
        },
      )}
      style={{ zoom: appScale }}
      onClick={() => {
        setIsMenuOpen(false);
        setIsStartFilePanelOpen(false);
        setIsAiPanelOpen(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 叠加层，显示窗口控件 */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-40 flex w-full gap-2 p-4 *:pointer-events-auto",
          {
            "*:!pointer-events-none": ignoreMouse,
          },
        )}
      >
        {isMac && (
          <Button className="right-4 top-4 flex items-center gap-2 active:scale-100">
            <div
              className="size-3 rounded-full bg-red-500 active:bg-red-800"
              onClick={() => getCurrentWindow().close()}
            ></div>
            <div
              className="size-3 rounded-full bg-yellow-500 active:bg-yellow-800"
              onClick={() => getCurrentWindow().minimize()}
            ></div>
            <div
              className="size-3 rounded-full bg-green-500 active:bg-green-800"
              onClick={() =>
                getCurrentWindow()
                  .isMaximized()
                  .then((isMaximized) => setMaxmized(!isMaximized))
              }
            ></div>
          </Button>
        )}
        {/* 左上角菜单按钮 */}
        <IconButton
          onClick={(e) => {
            if (location.pathname !== "/") {
              if (location.pathname.startsWith("/welcome")) {
                Dialog.show({
                  title: "Skip Setup?",
                  content: "Are you sure you want to skip the setup process?",
                  buttons: [
                    {
                      text: "Yes",
                      onClick: () => navigate("/"),
                    },
                    {
                      text: "No",
                      onClick: () => {},
                    },
                  ],
                });
              } else {
                navigate("/");
              }
            } else {
              e.stopPropagation(); // 避免又触发了关闭
              setIsMenuOpen(!isMenuOpen);
            }
          }}
        >
          {location.pathname === "/" ? (
            isMenuOpen ? (
              <RectangleEllipsis />
            ) : (
              <Menu />
            )
          ) : (
            <ChevronLeft />
          )}
        </IconButton>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setIsTagPanelOpen(!isTagPanelOpen);
          }}
        >
          <Tag
            className={cn("cursor-pointer", isTagPanelOpen ? "rotate-90" : "")}
          />
        </IconButton>
        {/* 中间标题 */}
        {useNativeTitleBar || isWeb ? (
          // h-0 才能完全摆脱划线时经过此区域的卡顿问题
          <div className="pointer-events-none h-0 flex-1"></div>
        ) : (
          <>
            <Button
              data-tauri-drag-region
              className={cn(
                "hover:cursor-move active:scale-100 active:cursor-grabbing",
                {
                  "text-yellow-500": isSaved,
                  "flex-1": isDesktop,
                },
              )}
            >
              {isMobile && filename + (isSaved ? "" : t("unsaved"))}
            </Button>
            {isMobile && <div className="flex-1"></div>}
            {isDesktop && (
              <span
                data-tauri-drag-region
                className={cn(
                  isSaved ? "" : "text-yellow-500",
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                )}
              >
                {filename + (isSaved ? "" : t("unsaved"))}
              </span>
            )}
          </>
        )}
        {/* 右上角AI按钮 */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setIsAiPanelOpen(!isAiPanelOpen);
          }}
        >
          <BrainCircuit
            className={cn("cursor-pointer", isAiPanelOpen ? "rotate-90" : "")}
          />
        </IconButton>
        {/* 右上角图钉按钮 */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setIsStartFilePanelOpen(!isStartFilePanelOpen);
          }}
        >
          <Zap
            className={cn(
              "cursor-pointer",
              isStartFilePanelOpen ? "rotate-45 scale-125" : "",
            )}
          />
        </IconButton>
        {/* 右上角窗口控制按钮 */}
        {isDesktop && !useNativeTitleBar && !isMac && !isWeb && (
          <Button className="right-4 top-4 flex items-center gap-1 active:scale-100">
            <ChevronDown
              onClick={() => getCurrentWindow().minimize()}
              className="transition hover:opacity-80 active:scale-75"
            />
            {maxmized ? (
              <Diamond
                onClick={() => setMaxmized(false)}
                size={16}
                strokeWidth={3}
                className="transition hover:opacity-80 active:scale-75"
              />
            ) : (
              <ChevronUp
                onClick={() => setMaxmized(true)}
                className="transition hover:opacity-80 active:scale-75"
              />
            )}
            <X
              onClick={() => getCurrentWindow().close()}
              className="transition hover:opacity-80 active:scale-75"
            />
          </Button>
        )}
      </div>

      {/* 面板列表 */}
      <AppMenu className="absolute left-4 top-16 z-20" open={isMenuOpen} />
      <TagPanel open={isTagPanelOpen} className="z-10" />
      <StartFilePanel open={isStartFilePanelOpen} />
      <AiPanel open={isAiPanelOpen} />
      <RecentFilesPanel />
      <ExportTreeTextPanel />
      {/* ======= */}
      <ErrorHandler />

      <Outlet />
    </div>
  );
}

export function Catch() {
  return <></>;
}
