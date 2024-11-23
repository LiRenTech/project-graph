// import { readTextFile } from "@tauri-apps/plugin-fs";
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
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
import { RecentFileManager } from "../core/RecentFileManager";
import { Stage } from "../core/stage/Stage";
import { StageSaveManager } from "../core/stage/StageSaveManager";
import { useDialog } from "../utils/dialog";
import { isDesktop } from "../utils/platform";

export default function RecentFilesPanel() {
  const [recentFiles, setRecentFiles] = React.useState<
    RecentFileManager.RecentFile[]
  >([]);
  const dialog = useDialog();

  const [isRecentFilePanelOpen, setRecentFilePanelOpen] = useRecoilState(
    isRecentFilePanelOpenAtom,
  );
  const [currentFile, setFile] = useRecoilState(fileAtom);

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
  }, [isRecentFilePanelOpen]);

  useEffect(() => {
    updateRecentFiles();
    return () => {};
  }, []);

  const onClickFile = (file: RecentFileManager.RecentFile) => {
    return () => {
      if (currentFile === Stage.Path.draftName) {
        dialog.show({
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
          dialog.show({
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
        dialog.show({
          title: "请选择一个JSON文件",
          type: "error",
        });
        return;
      }
      RecentFileManager.openFileByPath(path);
      setRecentFilePanelOpen(false);
    } catch (error) {
      dialog.show({
        title: "请选择正确的JSON文件",
        content: String(error),
        type: "error",
      });
    }
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
          </tr>
        </thead>
        <tbody>
          {recentFiles.map((file, index) => (
            <tr key={index} className="hover:bg-gray-600">
              <td className="border-b border-gray-600 p-2 text-right text-gray-200">
                {index + 1}
              </td>
              <td
                className="cursor-pointer border-b border-gray-600 p-2 text-gray-200"
                onClick={onClickFile(file)}
              >
                {file.path}
              </td>
              <td className="cursor-pointer border-b border-gray-600 p-2 text-gray-200">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="absolute right-0 top-0 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
        onClick={() => setRecentFilePanelOpen(false)}
      >
        关闭
      </button>
    </div>
  );
}
