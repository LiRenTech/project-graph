// import { readTextFile } from "@tauri-apps/plugin-fs";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { fileAtom, isRecentFilePanelOpenAtom } from "../state";
import { cn } from "../utils/cn";
// import { NodeManager } from "../core/NodeManager";
// import { NodeLoader } from "../core/NodeLoader";
// import { Edge } from "../core/Edge";
// import { Camera } from "../core/stage/Camera";
// import { Stage } from "../core/stage/Stage";
// import { ViewFlashEffect } from "../core/effect/concrete/ViewFlashEffect";
// import { Color } from "../core/Color";
// import { Node } from "../core/Node";
import { Zap } from "lucide-react";
import IconButton from "../components/ui/IconButton";
import { RecentFileManager } from "../core/RecentFileManager";
import { Stage } from "../core/stage/Stage";
import { StageSaveManager } from "../core/stage/StageSaveManager";
import { StartFilesManager } from "../core/StartFilesManager";
import { Dialog } from "../utils/dialog";
import { PathString } from "../utils/pathString";
import { isDesktop } from "../utils/platform";

export default function RecentFilesPanel() {
  const [recentFiles, setRecentFiles] = React.useState<
    RecentFileManager.RecentFile[]
  >([]);

  const [isRecentFilePanelOpen, setRecentFilePanelOpen] = useAtom(
    isRecentFilePanelOpenAtom,
  );
  const [currentFile, setFile] = useAtom(fileAtom);

  /**
   * 用于刷新页面显示
   */
  const updateRecentFiles = async () => {
    await RecentFileManager.validAndRefreshRecentFiles();
    await RecentFileManager.sortTimeRecentFiles();
    const files = await RecentFileManager.getRecentFiles();
    setRecentFiles(files);
  };

  useEffect(() => {
    updateRecentFiles();
    Stage.isAutoSavePaused = isRecentFilePanelOpen;
  }, [isRecentFilePanelOpen]);

  useEffect(() => {
    updateRecentFiles();
    return () => {};
  }, []);

  const onCheckoutFile = (file: RecentFileManager.RecentFile) => {
    return () => {
      if (currentFile === Stage.Path.draftName) {
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

  return (
    <div
      className={cn(
        "fixed left-1/2 top-1/2 z-10 flex h-4/5 w-3/4 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center overflow-y-scroll rounded-md bg-gray-800 px-2 py-6",
        {
          hidden: !isRecentFilePanelOpen,
        },
      )}
    >
      <h2 className="mb-3 text-xl font-bold text-white">最近打开的文件</h2>
      <table className="min-w-full overflow-hidden rounded-lg border border-gray-600 bg-gray-700 shadow-lg">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-4 py-2 text-left"></th>
            <th className="px-4 py-2 text-left">路径</th>
            <th className="px-4 py-2 text-left">时间</th>
            <th className="px-4 py-2 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {recentFiles.map((file, index) => (
            <tr key={index} className="text-gray-200 hover:bg-gray-600">
              {/* 标号列 */}
              <td className="text-center">{index + 1}</td>
              {/* 路径列 */}
              <td className="flex flex-col" onClick={onCheckoutFile(file)}>
                <span>{PathString.absolute2file(file.path)}</span>
                <span className="text-xs text-gray-500">{file.path}</span>
              </td>
              {/* 时间列 */}
              <td className="">
                <span className="text-xs">
                  {new Date(file.time).toLocaleString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    weekday: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </span>
              </td>
              <td>
                <IconButton onClick={addToStartFiles(file.path)}>
                  <Zap />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>提示：点击文件可以快速切换</p>
      <button
        className="absolute right-0 top-0 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
        onClick={() => setRecentFilePanelOpen(false)}
      >
        关闭
      </button>
    </div>
  );
}
