// import { readTextFile } from "@tauri-apps/plugin-fs";
import React, { useEffect } from "react";
import { cn } from "../utils/cn";
import { fileAtom, isRecentFilePanelOpenAtom } from "../state";
import { useRecoilState } from "recoil";
// import { NodeManager } from "../core/NodeManager";
// import { NodeLoader } from "../core/NodeLoader";
// import { Edge } from "../core/Edge";
// import { Camera } from "../core/stage/Camera";
// import { Stage } from "../core/stage/Stage";
// import { ViewFlashEffect } from "../core/effect/concrete/ViewFlashEffect";
// import { Color } from "../core/Color";
// import { Node } from "../core/Node";
import { RecentFileManager } from "../core/RecentFileManager";
import { useDialog } from "../utils/dialog";
import { isDesktop } from "../utils/platform";

export default function RecentFilesPanel() {
  const [recentFiles, setRecentFiles] = React.useState<
    RecentFileManager.RecentFile[]
  >([]);
  const dialog = useDialog();
  const [_, setFile] = useRecoilState(fileAtom);

  const [isRecentFilePanelOpen, setRecentFilePanelOpen] = useRecoilState(
    isRecentFilePanelOpenAtom,
  );

  /**
   * 用于刷新页面显示
   */
  const updateRecentFiles = () => {
    RecentFileManager.getRecentFiles().then((files) => {
      setRecentFiles(files);
    });
  };

  useEffect(() => {
    updateRecentFiles();
  }, [isRecentFilePanelOpen]);

  useEffect(() => {
    updateRecentFiles();
    return () => {
      console.log("Recent Files Panel unmounted");
    };
  }, []);

  const onClickFile = (file: RecentFileManager.RecentFile) => {
    return () => {
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
        console.log("正在打开文件", `<${path}>`, typeof path);
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
  };

  return (
    <div
      className={cn(
        "fixed left-1/2 top-1/2 z-10 flex h-64 w-3/4 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded-md bg-gray-800 p-2",
        {
          hidden: !isRecentFilePanelOpen,
        },
      )}
    >
      <h2 className="mb-3 text-xl font-bold text-white">最近打开的文件</h2>
      <table className="min-w-full overflow-hidden rounded-lg border border-gray-600 bg-gray-700 shadow-lg">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-4 py-2 text-left">路径</th>
            <th className="px-4 py-2 text-left">时间</th>
          </tr>
        </thead>
        <tbody>
          {recentFiles.map((file, index) => (
            <tr key={index} className="hover:bg-gray-600">
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
