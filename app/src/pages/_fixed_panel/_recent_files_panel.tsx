// import { readTextFile } from "@tauri-apps/plugin-fs";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { fileAtom, isRecentFilePanelOpenAtom } from "../../state";
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
import { LoaderPinwheel } from "lucide-react";

export default function RecentFilesPanel() {
  const [recentFiles, setRecentFiles] = React.useState<RecentFileManager.RecentFile[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [isRecentFilePanelOpen, setRecentFilePanelOpen] = useAtom(isRecentFilePanelOpenAtom);
  const [currentFile, setFile] = useAtom(fileAtom);

  /**
   * 用于刷新页面显示
   */
  const updateRecentFiles = async () => {
    setIsLoading(true);
    await RecentFileManager.validAndRefreshRecentFiles();
    await RecentFileManager.sortTimeRecentFiles();
    const files = await RecentFileManager.getRecentFiles();
    setRecentFiles(files);
    setIsLoading(false);
  };

  useEffect(() => {
    updateRecentFiles();
    Stage.autoSaveEngine.setAutoSavePaused(isRecentFilePanelOpen);
  }, [isRecentFilePanelOpen]);

  useEffect(() => {
    updateRecentFiles();
    return () => {};
  }, []);

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
      RecentFileManager.openFileByPath(path);
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
        "bg-panel-bg fixed left-1/2 top-1/2 z-10 flex h-4/5 w-full -translate-x-1/2 -translate-y-1/2 transform flex-col items-center overflow-hidden rounded-md px-2 py-6", // 添加 relative
        {
          hidden: !isRecentFilePanelOpen,
        },
      )}
    >
      {/* 关闭按钮放置在最外层 */}
      <button
        className="absolute right-2 top-2 z-20 cursor-pointer rounded bg-red-500 px-4 py-2 font-bold text-white hover:scale-105 hover:bg-red-700" // 调整位置和层级
        onClick={() => setRecentFilePanelOpen(false)}
      >
        关闭
      </button>

      <h2 className="text-panel-text mb-3 text-xl font-bold">最近打开的文件</h2>
      {/* 加载中提示 */}
      {isLoading && (
        <div className="flex h-full items-center justify-center text-8xl">
          <LoaderPinwheel className="scale-200 animate-spin" />
        </div>
      )}
      {/* 滚动区域单独封装 */}
      {!isLoading && (
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
              {recentFiles.map((file, index) => (
                <tr key={index} className="bg-table-row-bg hover:bg-table-row-hover-bg">
                  {/* 标号列 */}
                  <td className="text-table-row-text text-center">{index + 1}</td>
                  {/* 路径列 */}
                  <td className="text-table-row-text flex flex-col" onClick={onCheckoutFile(file)}>
                    <span>{PathString.getShortedFileName(PathString.absolute2file(file.path), 30, 0.8)}</span>
                    <span className="text-panel-details-text text-xs opacity-50">{file.path}</span>
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
                    <div className="flex w-36">
                      <button
                        onClick={addToStartFiles(file.path)}
                        className="bg-button-bg text-button-text border-button-border m-0.5 cursor-pointer rounded-lg p-1 text-xs hover:scale-105"
                      >
                        添加启动
                      </button>
                      <button
                        onClick={addPortalNodeToStage(file.path)}
                        className="bg-button-bg text-button-text border-button-border m-0.5 cursor-pointer rounded-lg p-1 text-xs hover:scale-105"
                      >
                        添加传送门
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-panel-text">提示：点击文件可以快速切换</p>
    </div>
  );
}
