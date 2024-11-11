import { useEffect } from "react";
import Button from "../components/ui/Button";
import { isDesktop } from "../utils/platform";
import { useDialog } from "../utils/dialog";
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { StartFilesManager } from "../core/StartFilesManager";
import React from "react";
import { useRecoilState } from "recoil";
import { fileAtom } from "../state";
import { RecentFileManager } from "../core/RecentFileManager";
import { StageSaveManager } from "../core/stage/StageSaveManager";
import { PathString } from "../utils/pathString";
import Switch from "../components/ui/Switch";
import { cn } from "../utils/cn";

export default function StartFilePanel({ open = false }: { open: boolean }) {
  const dialog = useDialog();
  const [startFiles, setStartFiles] = React.useState<
    StartFilesManager.StartFile[]
  >([]);

  const [currentStartFile, setCurrentStartFile] = React.useState<string>("");
  const [currentFile, setFile] = useRecoilState(fileAtom);
  const [isShowAbsolutePath, setIsShowAbsolutePath] = React.useState(false);
  const [isShowTime, setIsShowTime] = React.useState(false);
  const [isPanelTransparent, setIsPanelTransparent] = React.useState(false);

  useEffect(() => {
    updateStartFiles();
    console.log("StartFilePanel mounted");
  }, []);

  const updateStartFiles = async () => {
    const files = await StartFilesManager.getStartFiles();
    const current = await StartFilesManager.getCurrentStartFile();
    setCurrentStartFile(current);
    setStartFiles(files);
  };
  const onClearList = async () => {
    const clearSuccess = await StartFilesManager.clearStartFiles();
    if (clearSuccess) {
      dialog.show({
        title: "清空成功",
        content: "已清空启动文件列表",
        type: "success",
      });
      updateStartFiles();
    } else {
      dialog.show({
        title: "清空失败",
        content: "启动文件列表为空",
        type: "error",
      });
    }
  };
  const onAddFile = async () => {
    const path = await openFileDialog({
      title: "打开文件",
      directory: false,
      multiple: false,
      filters: isDesktop
        ? [
            {
              name: "Project Graph",
              extensions: ["json"],
            },
          ]
        : [],
    });
    if (!path) {
      return;
    }
    if (isDesktop && !path.endsWith(".json")) {
      dialog.show({
        title: "请选择一个JSON文件",
        type: "error",
      });
      return;
    }
    try {
      const addSuccess = await StartFilesManager.addStartFile(path);
      if (!addSuccess) {
        dialog.show({
          title: "文件添加失败",
          content: `可能是重复了：${path}`,
          type: "error",
        });
      }
      updateStartFiles();
    } catch (e) {
      dialog.show({
        title: "请选择正确的JSON文件",
        content: String(e),
        type: "error",
      });
    }
  };
  const onSetCurrentStartFile = (path: string) => {
    return function () {
      StartFilesManager.setCurrentStartFile(path).then((res) => {
        if (res) {
          setCurrentStartFile(path);
        } else {
          dialog.show({
            title: "文件切换失败",
            content: `文件不存在：${path}`,
            type: "error",
          });
        }
      });
    };
  };
  const onLoadCurrentStartFile = (path: string) => {
    return function () {
      if (currentFile === "Project Graph") {
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
                checkoutFile(path);
              },
            },
          ],
        });
      } else {
        if (StageSaveManager.isSaved()) {
          checkoutFile(path);
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
  const checkoutFile = (path: string) => {
    try {
      setFile(decodeURIComponent(path));
      if (isDesktop && !path.endsWith(".json")) {
        dialog.show({
          title: "请选择一个JSON文件",
          type: "error",
        });
        return;
      }
      RecentFileManager.openFileByPath(path);
    } catch (error) {
      dialog.show({
        title: "请选择正确的JSON文件",
        content: String(error),
        type: "error",
      });
    }
  };

  const onRemoveFile = (path: string) => {
    return function () {
      StartFilesManager.removeStartFile(path).then((res) => {
        if (res) {
          updateStartFiles();
        } else {
          dialog.show({
            title: "从列表中移除失败",
            content: `文件不存在：${path}`,
            type: "error",
          });
        }
      });
    };
  };

  return (
    <>
      {open && (
        <div
          className={cn(
            {
              "scale-100 opacity-100": open,
            },
            isPanelTransparent ? "bg-gray-800/20" : "bg-gray-800",
            "fixed left-1/2 top-1/2 z-10 flex h-4/5 w-3/4 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center overflow-y-scroll rounded-md px-2 py-6 transition-all",
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <h2
            className={cn(
              isPanelTransparent ? "opacity-0" : "",
              "mb-3 text-xl font-bold text-white transition-opacity",
            )}
          >
            选择启动时自动加载的工程文件
          </h2>
          <div
            className={cn(
              isPanelTransparent ? "opacity-0" : "",
              "mb-3 flex justify-between transition-opacity",
            )}
          >
            <Button onClick={onAddFile}>添加文件</Button>
            <Button onClick={onClearList}>清空列表</Button>
          </div>
          <table
            className={cn(
              isPanelTransparent ? "bg-gray-700/20" : "bg-gray-700",
              "overflow-hidden rounded-lg border border-gray-600 shadow-lg transition-all",
            )}
          >
            <thead>
              {/* <tr className="text-white">
            <th className="mx-4 py-2 text-left">状态</th>
            <th className="mx-4 py-2 text-left">路径</th>
            {isShowTime && <th className="mx-4 py-2 text-left">时间</th>}
            <th className="mx-4 py-2 text-left">操作</th>
          </tr> */}
            </thead>
            <tbody>
              {startFiles.map((file) => (
                <tr
                  key={file.path}
                  className={cn("border-b border-gray-600 p-2 text-gray-200")}
                >
                  <td className="w-10 text-center">
                    <div className="inline-block animate-bounce">
                      {currentStartFile === file.path ? "📌" : ""}
                    </div>
                  </td>
                  <td>
                    <td>
                      <div className="flex flex-col">
                        <span
                          className={
                            currentFile === file.path ? "text-green-400" : ""
                          }
                        >
                          {PathString.absolute2file(file.path)}
                        </span>
                        {isShowAbsolutePath && (
                          <span className="text-xs text-gray-500">
                            {file.path}
                          </span>
                        )}
                      </div>
                    </td>
                  </td>
                  {isShowTime && (
                    <td className="text-gray-500">
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
                  )}
                  <td>
                    <Button
                      className="mx-0.5 px-2 py-1"
                      onClick={onLoadCurrentStartFile(file.path)}
                      onMouseEnter={() => setIsPanelTransparent(true)}
                      onMouseLeave={() => setIsPanelTransparent(false)}
                    >
                      加载
                    </Button>
                    <Button
                      className="mx-0.5 px-2 py-1"
                      onClick={onSetCurrentStartFile(file.path)}
                    >
                      钉选
                    </Button>
                    <Button
                      className="mx-0.5 px-2 py-1"
                      onClick={onRemoveFile(file.path)}
                    >
                      移除
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className={cn(
              isPanelTransparent ? "opacity-0" : "",
              "transition-opacity",
            )}
          >
            <div className="mt-3 text-sm text-gray-500">
              <p>
                说明：启动时自动加载的工程文件会在打开时自动加载到舞台，无需手动打开。
              </p>
              <p>
                钉选：切换当前的启动文件，左侧状态中的图标代表当前的启动文件。
              </p>
              <p>移除：仅从列表中移除文件，不会影响文件本身。</p>
              <p>
                加载：仅将这个文件加载到舞台（您可以通过悬浮透明来查看切换后是否是您想要的文件）
              </p>
            </div>
            <div>
              <div className="flex flex-nowrap items-center justify-center">
                <span className="mr-2">显示绝对路径</span>
                <Switch
                  value={isShowAbsolutePath}
                  onChange={(v) => setIsShowAbsolutePath(v)}
                />
              </div>
              <div className="flex flex-nowrap items-center justify-center">
                <span className="mr-2">显示时间</span>
                <Switch value={isShowTime} onChange={(v) => setIsShowTime(v)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
