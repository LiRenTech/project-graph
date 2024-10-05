import React, { useEffect } from "react";
import { RecentFileManager } from "../core/RecentFileManager";
import { cn } from "../utils/cn";
import { isRecentFilePanelOpenAtom } from "../state";
import { useRecoilState } from "recoil";

export default function RecentFilesPanel() {
  const [recentFiles, setRecentFiles] = React.useState<
    RecentFileManager.RecentFile[]
  >([]);

  const [isRecentFilePanelOpen, setRecentFilePanelOpen] = useRecoilState(
    isRecentFilePanelOpenAtom,
  );

  /**
   * 用于刷新页面显示
   */
  const updateRecentFiles = () => {
    RecentFileManager.refreshRecentFiles().then(() => {
      RecentFileManager.getRecentFiles().then((files) => {
        setRecentFiles(files);
      });
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
              <td className="cursor-pointer border-b border-gray-600 p-2 text-gray-200">
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
