import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Diamond,
  Menu,
  X,
  Zap,
  RectangleEllipsis,
} from "lucide-react";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppMenu from "./_app_menu";
import IconButton from "../components/ui/IconButton";
import Button from "../components/ui/Button";
import { cn } from "../utils/cn";
import Dialog from "../components/ui/Dialog";
import { appScale, isDesktop, isMobile } from "../utils/platform";
import { useRecoilState } from "recoil";
import { fileAtom } from "../state";
import RecentFilesPanel from "./_recent_files_panel";
import { Settings } from "../core/Settings";
import ErrorHandler from "./_error_handler";
import PopupDialog from "../components/ui/PopupDialog";
import { useDialog } from "../utils/dialog";
import { StageSaveManager } from "../core/stage/StageSaveManager";
import { StageDumper } from "../core/stage/StageDumper";
import StartFilePanel from "./_start_file_panel";
import { PathString } from "../utils/pathString";

export default function App() {
  const [maxmized, setMaxmized] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isStartFilePanelOpen, setIsStartFilePanelOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [file] = useRecoilState(fileAtom);
  const filename = React.useMemo(() => PathString.absolute2file(file), [file]);
  const dialog = useDialog();
  const [useNativeTitleBar, setUseNativeTitleBar] = React.useState(false);

  React.useEffect(() => {
    getCurrentWindow().onResized(() => {
      getCurrentWindow()
        .isMaximized()
        .then((isMaximized) => {
          setMaxmized(isMaximized);
        });
    });
    window.addEventListener("keyup", async (event) => {
      if (event.key === "F5") {
        window.location.reload();
      }
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

    return () => {
      clearInterval(saveInterval);
    };
  }, []);

  React.useEffect(() => {
    if (file === "Project Graph") {
      getCurrentWindow().setTitle("Project Graph");
    } else {
      getCurrentWindow().setTitle(`${filename} - Project Graph`);
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

  const handleClose = () => {
    if (file === "Project Graph") {
      dialog.show({
        title: "真的要关闭吗？",
        content: "您现在的新建草稿没有保存，是否要关闭项目？",
        buttons: [
          {
            text: "直接关闭，这个草稿不值得保存",
            onClick: () => {
              getCurrentWindow().close();
            },
          },
          {
            text: "啊不不不，我要另存为",
            onClick: () => {},
          },
        ],
      });
    } else {
      // 先检查下是否开启了自动保存
      Settings.get("autoSaveWhenClose").then((isAutoSave) => {
        if (isAutoSave) {
          // 开启了自动保存，不弹窗
          StageSaveManager.saveHandle(
            file,
            StageDumper.dump(),
            () => {
              // 成功
              getCurrentWindow().close();
            },
            () => {
              // 失败
              dialog.show({
                title: "保存失败",
                content: "保存失败，请重试",
                buttons: [
                  {
                    text: "确定",
                    onClick: () => {},
                  },
                ],
              });
            },
          );
        } else {
          // 没开启自动保存，逐步确认
          if (StageSaveManager.isSaved()) {
            getCurrentWindow().close();
          } else {
            dialog.show({
              title: "真的要关闭吗？",
              content: "您现在的没有保存，是否要关闭项目？",
              buttons: [
                {
                  text: "保存并关闭",
                  onClick: () => {
                    StageSaveManager.saveHandle(
                      file,
                      StageDumper.dump(),
                      () => {
                        // 成功
                        getCurrentWindow().close();
                      },
                      () => {
                        // 失败
                        dialog.show({
                          title: "保存失败",
                          content: "保存失败，请重试",
                          buttons: [
                            {
                              text: "确定",
                              onClick: () => {},
                            },
                          ],
                        });
                      },
                    );
                  },
                },
                {
                  text: "取消关闭",
                  onClick: () => {},
                },
              ],
            });
          }
        }
      });
    }
  };

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
        // setIsStartFilePanelOpen(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Dialog />
      <PopupDialog />
      <ErrorHandler />
      {/* 叠加层，显示窗口控件 */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-40 flex w-full gap-2 p-4 transition-all *:pointer-events-auto",
          {
            "p-8": isMobile,
          },
        )}
      >
        {/* 菜单按钮 */}
        <IconButton
          onClick={(e) => {
            if (location.pathname !== "/") {
              if (location.pathname.startsWith("/welcome")) {
                dialog.show({
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
              e.stopPropagation();
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
        <AppMenu className="absolute top-20" open={isMenuOpen} />
        <RecentFilesPanel />
        {isStartFilePanelOpen && <StartFilePanel />}
        {/* 中间标题 */}
        {useNativeTitleBar ? (
          <div className="flex-1"></div>
        ) : (
          <>
            <Button
              data-tauri-drag-region
              className={cn(
                "flex-1 hover:cursor-move active:scale-100 active:cursor-grabbing",
                isSaved ? "" : "text-yellow-500",
              )}
            ></Button>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {filename}
            </span>
          </>
        )}
        {/* 右上角图钉按钮 */}
        <IconButton
          onClick={() => setIsStartFilePanelOpen(!isStartFilePanelOpen)}
        >
          <Zap
            className={cn(
              "cursor-pointer transition",
              isStartFilePanelOpen ? "rotate-45 scale-125" : "",
            )}
          />
        </IconButton>
        {/* 右上角窗口控制按钮 */}
        {isDesktop && !useNativeTitleBar && (
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
              onClick={() => handleClose()}
              className="transition hover:opacity-80 active:scale-75"
            />
          </Button>
        )}
      </div>
      <Outlet />
    </div>
  );
}

export function Catch() {
  return <></>;
}
