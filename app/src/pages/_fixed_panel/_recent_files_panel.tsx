// import { readTextFile } from "@tauri-apps/plugin-fs";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { fileAtom, isRecentFilePanelOpenAtom } from "../../state";
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { cn } from "../../utils/cn";

// import { Zap } from "lucide-react";
// import IconButton from "../components/ui/IconButton";
import { Dialog } from "../../components/dialog";
import { RecentFileManager } from "../../core/service/dataFileService/RecentFileManager";
import { StageSaveManager } from "../../core/service/dataFileService/StageSaveManager";
import { StartFilesManager } from "../../core/service/dataFileService/StartFilesManager";
import { Stage } from "../../core/stage/Stage";
import { StageManager } from "../../core/stage/stageManager/StageManager";
import { PathString } from "../../utils/pathString";
import { isDesktop } from "../../utils/platform";
import { CircleHelp, EyeOff, FolderInput, LoaderPinwheel, Radiation, VenetianMask, X } from "lucide-react";
import { replaceTextWhenProtect } from "../../utils/font";
import { FileLoader } from "../../core/service/dataFileService/fileLoader";
import { KeyboardOnlyEngine } from "../../core/service/controlService/keyboardOnlyEngine/keyboardOnlyEngine";
import Input from "../../components/Input";
import IconButton from "../../components/IconButton";
import { myOpen } from "../../utils/externalOpen";
import { readFolderRecursive } from "../../utils/fs";

/**
 * 最近文件面板按钮
 * @returns
 */
export default function RecentFilesPanel() {
  /**
   * 数据中有多少就是多少
   */
  const [recentFiles, setRecentFiles] = React.useState<RecentFileManager.RecentFile[]>([]);
  /**
   * 经过搜索字符串过滤后的
   */
  const [recentFilesFiltered, setRecentFilesFiltered] = React.useState<RecentFileManager.RecentFile[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [isRecentFilePanelOpen, setRecentFilePanelOpen] = useAtom(isRecentFilePanelOpenAtom);
  const [currentFile, setFile] = useAtom(fileAtom);
  const [isInPrivacy, setInPrivacy] = React.useState(false);

  // 当前预选中的文件下标
  const [currentPreselect, setCurrentPreselect] = React.useState<number>(0);
  const [searchString, setSearchString] = React.useState("");

  /**
   * 用于刷新页面显示
   */
  const updateRecentFiles = async () => {
    setIsLoading(true);
    await RecentFileManager.validAndRefreshRecentFiles();
    await RecentFileManager.sortTimeRecentFiles();
    const files = await RecentFileManager.getRecentFiles();
    setRecentFiles(files);
    setRecentFilesFiltered(files);
    setIsLoading(false);
  };

  const onInputChange = (input: string) => {
    console.log(input, "inputContent");
    if (input === "#") {
      // 默认的shift + 3 会触发井号
      return;
    }
    setCurrentPreselect(0); // 一旦有输入，就设置下标为0
    setSearchString(input);
    setRecentFilesFiltered(recentFiles.filter((file) => file.path.includes(input)));
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setRecentFilePanelOpen(false);
    }
  };

  useEffect(() => {
    updateRecentFiles();
    Stage.autoSaveEngine.setAutoSavePaused(isRecentFilePanelOpen);
    // 临时禁用纯键盘引擎
    KeyboardOnlyEngine.setOpenning(!isRecentFilePanelOpen);
    if (isRecentFilePanelOpen) {
      const input = document.querySelector(".recent-files-panel-search-input") as HTMLInputElement;
      input.focus();
    }
  }, [isRecentFilePanelOpen]);

  useEffect(() => {
    updateRecentFiles();
  }, []);
  /**
   * 按键事件
   * @param e
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isRecentFilePanelOpen) {
      return;
    }
    console.log("key down in recent files panel");
    if (e.key === "Escape") {
      setRecentFilePanelOpen(false);
    } else if (e.key === "ArrowUp") {
      setCurrentPreselect((prev) => Math.max(0, prev - 1));
    } else if (e.key === "ArrowDown") {
      setCurrentPreselect((prev) => Math.min(recentFilesFiltered.length - 1, prev + 1));
    } else if (e.key === "Enter") {
      const file = recentFilesFiltered[currentPreselect];
      checkoutFile(file);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRecentFilePanelOpen, recentFilesFiltered]); // isRecentFilePanelOpen, recentFiles, currentPreselect

  const onCheckoutFile = (file: RecentFileManager.RecentFile) => {
    return () => {
      if (currentFile === Stage.path.draftName) {
        Dialog.show({
          title: "真的要切换吗？",
          content: "您现在的新建草稿没有保存，是否要切换项目？",
          buttons: [
            {
              text: "取消",
              onClick: () => {},
            },
            {
              text: "切换",
              onClick: () => {
                checkoutFile(file);
              },
            },
          ],
        });
      } else {
        if (StageSaveManager.isSaved()) {
          checkoutFile(file);
        } else {
          Dialog.show({
            title: "切换失败",
            content: "由于您当前的文件没有保存，请先保存后再切换文件",
            type: "error",
          });
        }
      }
    };
  };
  const checkoutFile = (file: RecentFileManager.RecentFile) => {
    try {
      const path = file.path;
      setFile(decodeURIComponent(path));
      if (isDesktop && !path.endsWith(".json")) {
        Dialog.show({
          title: "请选择一个JSON文件",
          type: "error",
        });
        return;
      }
      FileLoader.openFileByPath(path);
      setRecentFilePanelOpen(false);
    } catch (error) {
      Dialog.show({
        title: "请选择正确的JSON文件",
        content: String(error),
        type: "error",
      });
    }
  };
  const addToStartFiles = (path: string) => {
    return async () => {
      const addSuccess = await StartFilesManager.addStartFile(path);
      if (!addSuccess) {
        Dialog.show({
          title: "文件添加失败",
          content: `可能是重复了：${path}`,
          type: "error",
        });
      } else {
        Dialog.show({
          title: "添加成功",
          content: `已经成功添加到快速启动界面的列表：${path}`,
          type: "success",
        });
      }
    };
  };

  const removeStartFile = (path: string) => {
    return async () => {
      const removeSuccess = await RecentFileManager.removeRecentFileByPath(path);
      if (!removeSuccess) {
        Dialog.show({
          title: "文件删除失败",
          content: `可能是文件不存在：${path}`,
          type: "error",
        });
      } else {
        Dialog.show({
          title: "删除成功",
          content: `已经成功从快速启动界面的列表中删除：${path}`,
          type: "success",
        });
        updateRecentFiles();
      }
    };
  };

  const addPortalNodeToStage = (path: string) => {
    return () => {
      const result = StageManager.addPortalNodeToStage(path);
      if (result) {
        Dialog.show({
          title: "添加传送门成功",
          content: `已经成功添加传送门：${path}，注意看您的舞台上已经多了一个传送门`,
        });
      } else {
        Dialog.show({
          title: "添加传送门失败",
          content: `可能是这个文件和当前文件路径距离过远`,
        });
      }
    };
  };

  return (
    <div
      className={cn(
        "bg-settings-page-bg fixed left-1/2 top-1/2 z-10 flex h-4/5 w-full -translate-x-1/2 -translate-y-1/2 transform flex-col items-center overflow-hidden rounded-md px-2 py-1", // 添加 relative
        {
          hidden: !isRecentFilePanelOpen,
        },
      )}
    >
      {/* 顶部区域 */}
      <div className="my-1 flex w-full flex-nowrap items-center justify-between px-8">
        <h2 className="text-panel-details-text text-md">最近打开的文件</h2>
        <Input
          placeholder="请输入要筛选的文件"
          className="recent-files-panel-search-input text-sm"
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          value={searchString}
        />

        <div className="flex items-center gap-1">
          <IconButton
            onClick={() => {
              Dialog.show({
                title: "“最近打开的文件”界面说明",
                content:
                  "点击文件列表中的文件可以快速切换\n搜索和筛选文件时，会根据绝对路径匹配\n可用快捷键打开和关闭此面板",
              });
            }}
            tooltip="查看帮助"
          >
            <CircleHelp />
          </IconButton>
          <IconButton
            onClick={async () => {
              try {
                const path = await openFileDialog({
                  title: "选择包含JSON文件的文件夹",
                  directory: true,
                  multiple: false,
                });
                if (!path) {
                  return;
                }
                const jsonFiles = await readFolderRecursive(path, [".json"]);
                const filteredFiles = jsonFiles.filter((path) => !path.toLowerCase().includes("backup"));

                console.log(filteredFiles);

                await RecentFileManager.addRecentFilesByPaths(filteredFiles);
                updateRecentFiles();
                Dialog.show({
                  title: "导入完成",
                  content: `成功导入 ${filteredFiles.length} 个文件，过滤掉 ${jsonFiles.length - filteredFiles.length} 个备份文件`,
                  type: filteredFiles.length > 0 ? "success" : "info",
                });
              } catch (error) {
                Dialog.show({
                  title: "导入失败",
                  content: String(error),
                  type: "error",
                });
              }
            }}
            tooltip="从文件夹导入多个文件进入列表"
          >
            <FolderInput />
          </IconButton>
          <IconButton
            className="cursor-pointer rounded"
            onClick={() => {
              Dialog.show({
                title: "确认操作",
                content: "确认清空全部记录？",
                buttons: [
                  {
                    text: "取消",
                    onClick: () => {},
                  },
                  {
                    text: "确认",
                    onClick: () => {
                      setRecentFiles([]);
                      RecentFileManager.clearRecentFiles();
                    },
                  },
                ],
              });
            }}
            tooltip="清空全部记录"
          >
            <Radiation />
          </IconButton>
          <IconButton
            className="cursor-pointer rounded bg-gray-500 font-bold text-white hover:scale-105 hover:bg-red-700" // 调整位置和层级
            onClick={() => setInPrivacy(!isInPrivacy)}
            tooltip={isInPrivacy ? "关闭隐私模式" : "进入隐私模式，关闭路径和文件显示"}
          >
            {isInPrivacy ? <EyeOff /> : <VenetianMask />}
          </IconButton>
          <IconButton
            className="cursor-pointer hover:scale-105" // 调整位置和层级
            id="recent-files-panel-close-btn"
            onClick={() => setRecentFilePanelOpen(false)}
            tooltip="Esc 或再按一次进入面板快捷键 关闭"
          >
            <X />
          </IconButton>
        </div>
      </div>
      {/* 仅仅用作一个标签存在标记，快捷键id索引用 */}
      {isRecentFilePanelOpen && <div className="absolute left-0 top-0 h-1 w-1" id="recent-files-panel-open-mark-div" />}
      {/* 关闭按钮放置在最外层 */}

      {/* 加载中提示 */}
      {isLoading && (
        <div className="flex h-full items-center justify-center text-8xl">
          <LoaderPinwheel className="scale-200 animate-spin" />
        </div>
      )}
      {/* 滚动区域单独封装 */}
      {!isLoading && recentFilesFiltered.length === 0 && (
        <div className="flex h-full items-center justify-center text-8xl">
          <span>NULL</span>
        </div>
      )}
      {!isLoading && recentFilesFiltered.length > 0 && (
        <div className="flex-grow overflow-y-scroll">
          <table className="bg-panel-bg min-w-full overflow-hidden rounded-lg border border-gray-600 shadow-lg">
            <thead>
              <tr className="bg-table-header-bg text-table-header-text">
                <th className="px-4 py-2 text-left"></th>
                <th className="px-4 py-2 text-left">路径</th>
                <th className="px-4 py-2 text-left">时间</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {recentFilesFiltered.map((file, index) => (
                <tr
                  key={index}
                  className={cn(
                    "bg-table-row-bg hover:bg-table-row-hover-bg",
                    currentPreselect === index && "border-panel-success-text border-l-4",
                  )}
                >
                  {/* 标号列 */}
                  <td className="text-table-row-text text-center">{index + 1}</td>
                  {/* 路径列 */}
                  <td className="text-table-row-text flex flex-col" onClick={onCheckoutFile(file)}>
                    {isInPrivacy ? (
                      <>
                        <span>
                          {replaceTextWhenProtect(
                            PathString.getShortedFileName(PathString.absolute2file(file.path), 30, 0.8),
                          )}
                        </span>
                        <span className="text-panel-details-text text-xs opacity-50">
                          {replaceTextWhenProtect(file.path)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{PathString.getShortedFileName(PathString.absolute2file(file.path), 30, 0.8)}</span>
                        <span className="text-panel-details-text text-xs opacity-50">{file.path}</span>
                      </>
                    )}
                  </td>
                  {/* 时间列 */}
                  <td className="">
                    <span className="text-panel-details-text text-xs">
                      {new Date(file.time).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        // weekday: "long",
                        // hour: "2-digit",
                        // minute: "2-digit",
                        // second: "2-digit",
                        hour12: false,
                      })}
                    </span>
                  </td>
                  <td>
                    <div className="flex">
                      <button
                        onClick={removeStartFile(file.path)}
                        className="bg-button-bg text-button-text border-button-border hover:border-panel-success-text m-0.5 cursor-pointer rounded-lg border-2 p-1 text-xs hover:scale-105"
                      >
                        删除记录
                      </button>
                      <button
                        onClick={addToStartFiles(file.path)}
                        className="bg-button-bg text-button-text border-button-border hover:border-panel-success-text m-0.5 cursor-pointer rounded-lg border-2 p-1 text-xs hover:scale-105"
                      >
                        收藏
                      </button>
                      <button
                        onClick={addPortalNodeToStage(file.path)}
                        className="bg-button-bg text-button-text border-button-border hover:border-panel-success-text m-0.5 cursor-pointer rounded-lg border-2 p-1 text-xs hover:scale-105"
                      >
                        添加传送门
                      </button>
                      <button
                        onClick={handleOpenFile(file.path)}
                        className="bg-button-bg text-button-text border-button-border hover:border-panel-success-text m-0.5 cursor-pointer rounded-lg border-2 p-1 text-xs hover:scale-105"
                      >
                        打开位置
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const handleOpenFile = (file: string) => {
  return () => {
    myOpen(PathString.dirPath(file));
  };
};
