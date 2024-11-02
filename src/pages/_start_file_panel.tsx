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

export default function StartFilePanel() {
  const dialog = useDialog();
  const [startFiles, setStartFiles] = React.useState<
    StartFilesManager.StartFile[]
  >([]);

  const [currentStartFile, setCurrentStartFile] = React.useState<string>("");
  const [currentFile, setFile] = useRecoilState(fileAtom);

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
    }
  }
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
    <div className="fixed left-1/2 top-1/2 z-10 flex h-4/5 w-3/4 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center overflow-y-scroll rounded-md bg-gray-800 px-2 py-6">
      <h2 className="mb-3 text-xl font-bold text-white">
        选择启动时自动加载的工程文件
      </h2>
      <div className="mb-3 flex justify-between">
        <Button onClick={onAddFile}>添加文件</Button>
        <Button onClick={onClearList}>清空列表</Button>
      </div>
      <table className="min-w-full overflow-hidden rounded-lg border border-gray-600 bg-gray-700 shadow-lg">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-4 py-2 text-left">状态</th>
            <th className="px-4 py-2 text-left">路径</th>
            <th className="px-4 py-2 text-left">时间</th>
            <th className="px-4 py-2 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {startFiles.map((file) => (
            <tr key={file.path}>
              <td className="border-b border-gray-600 p-2 text-gray-200">
                <div className="animate-bounce inline-block">{currentStartFile === file.path ? "📌" : ""}</div>
              </td>
              <td className="border-b border-gray-600 p-2 text-gray-200 ">
                {file.path}
              </td>
              <td className="border-b border-gray-600 p-2 text-gray-200">
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
              <td className="border-b border-gray-600 p-2 text-gray-200">
                <Button onClick={onRemoveFile(file.path)}>移除</Button>
                <Button onClick={onSetCurrentStartFile(file.path)}>选择</Button>
                <Button onClick={onLoadCurrentStartFile(file.path)}>加载</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 text-sm text-gray-500">
        <p>说明：启动时自动加载的工程文件会在打开时自动加载到舞台，无需手动打开。</p>
        <p>选择：切换当前的启动文件，左侧状态中的图标代表当前的启动文件。</p>
        <p>移除：仅从列表中移除文件，不会影响文件本身。</p>
        <p>加载：仅将这个文件加载到舞台</p>
      </div>
    </div>
  );
}
